package com.sportify.backend.service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.sportify.backend.dto.BloqueHorarioDTO;
import com.sportify.backend.dto.HorarioDTO;
import com.sportify.backend.dto.ReservaDatos;
import com.sportify.backend.dto.ReservaResumen;
import com.sportify.backend.model.Auditoria;
import com.sportify.backend.model.Cancha;
import com.sportify.backend.model.EstadoReserva;
import com.sportify.backend.model.Reserva;
import com.sportify.backend.repository.AdministradorComplejoRepository;
import com.sportify.backend.repository.AuditoriaRepository;
import com.sportify.backend.repository.CanchaRepository;
import com.sportify.backend.repository.ReservaRepository;

/**
 * Crea, modifica, consulta, confirma y cancela reservas, validando el horario del
 * complejo, el estado de la cancha y los conflictos con otras reservas.
 *
 * @author Equipo Sportify
 */
@Service
@Transactional(readOnly = true)
public class ReservaService implements ConsultaReservas {

    private static final ZoneId ZONA = ZoneId.of("America/Lima");

    private final ReservaRepository reservas;
    private final CanchaRepository canchas;
    private final ConsultaHorarios horarios;
    private final AdministradorComplejoRepository administradores;
    private final AuditoriaRepository auditoria;

    /**
     * Crea el servicio con sus dependencias.
     *
     * @param reservas persistencia de reservas
     * @param canchas persistencia de canchas
     * @param horarios consulta de horarios de atención del complejo
     * @param administradores relación entre administradores y complejos
     * @param auditoria registro de acciones
     */
    public ReservaService(ReservaRepository reservas, CanchaRepository canchas,
            ConsultaHorarios horarios, AdministradorComplejoRepository administradores,
            AuditoriaRepository auditoria) {
        this.reservas = reservas;
        this.canchas = canchas;
        this.horarios = horarios;
        this.administradores = administradores;
        this.auditoria = auditoria;
    }

    // ------------------------------------------------------------------ consultas

    @Override
    public List<BloqueHorarioDTO> bloquesOcupados(Long idCancha, LocalDate fecha) {
        return reservas.findByIdCanchaAndFechaAndEstadoNot(idCancha, fecha, EstadoReserva.CANCELADA)
                .stream()
                .map(r -> new BloqueHorarioDTO(r.getHoraInicio(), r.getHoraFin()))
                .toList();
    }

    /**
     * Lista las reservas de un usuario, de la más reciente a la más antigua.
     *
     * @param idUsuario usuario autenticado
     * @return sus reservas; lista vacía si no tiene
     */
    public List<ReservaResumen> listarMias(Long idUsuario) {
        return resumir(reservas.findByIdUsuarioOrderByFechaDescHoraInicioDesc(idUsuario));
    }

    /**
     * Devuelve una reserva a su dueño o a quien administra el complejo.
     *
     * @param idReserva reserva consultada
     * @param idUsuario usuario solicitante
     * @param adminPlataforma si el solicitante es administrador de la plataforma
     * @return la reserva consultada
     * @throws ResponseStatusException si no existe o el solicitante no tiene acceso
     */
    public ReservaResumen obtener(Long idReserva, Long idUsuario, boolean adminPlataforma) {
        Reserva reserva = buscar(idReserva);
        if (!reserva.getIdUsuario().equals(idUsuario)) {
            Cancha cancha = buscarCancha(reserva.getIdCancha());
            verificarAdminComplejo(cancha.getIdComplejo(), idUsuario, adminPlataforma);
        }
        return resumir(List.of(reserva)).get(0);
    }

    /**
     * Lista las reservas de un complejo, opcionalmente de un solo día.
     *
     * @param idComplejo complejo consultado
     * @param fecha día a filtrar; null para todas
     * @param idUsuario usuario solicitante
     * @param adminPlataforma si el solicitante es administrador de la plataforma
     * @return reservas del complejo
     * @throws ResponseStatusException si el solicitante no administra el complejo
     */
    public List<ReservaResumen> listarPorComplejo(Long idComplejo, LocalDate fecha,
            Long idUsuario, boolean adminPlataforma) {
        verificarAdminComplejo(idComplejo, idUsuario, adminPlataforma);
        List<Reserva> lista = (fecha == null)
                ? reservas.listarPorComplejo(idComplejo)
                : reservas.listarPorComplejoYFecha(idComplejo, fecha);
        return resumir(lista);
    }

    // ------------------------------------------------------------------ comandos

    /**
     * Crea una reserva PENDIENTE si la franja es válida y está libre.
     *
     * @param idUsuario usuario que reserva
     * @param datos cancha, fecha y franja solicitadas
     * @return la reserva creada
     * @throws ResponseStatusException si la cancha no existe o no está activa, la franja
     *         es inválida o está fuera de horario, o ya está ocupada
     */
    @Transactional
    public ReservaResumen crear(Long idUsuario, ReservaDatos.Creacion datos) {
        Cancha cancha = canchas.buscarParaReservar(datos.idCancha())
                .orElseThrow(() -> error(HttpStatus.NOT_FOUND, "La cancha no existe."));
        validarCanchaActiva(cancha);
        validarFranja(cancha, datos.fecha(), datos.horaInicio(), datos.horaFin());
        validarSinConflicto(cancha.getIdCancha(), datos.fecha(), datos.horaInicio(), datos.horaFin(), 0L);

        Reserva guardada = reservas.save(new Reserva(cancha.getIdCancha(), idUsuario,
                datos.fecha(), datos.horaInicio(), datos.horaFin()));
        auditoria.save(new Auditoria("CREAR_RESERVA",
                "Reserva " + guardada.getIdReserva() + " en " + cancha.getNombre()));
        return resumir(List.of(guardada)).get(0);
    }

    /**
     * Cambia la fecha u hora de una reserva. Solo su dueño; si estaba confirmada
     * vuelve a PENDIENTE para que el administrador la confirme de nuevo.
     *
     * @param idReserva reserva a modificar
     * @param idUsuario usuario solicitante
     * @param datos nueva fecha y franja
     * @return la reserva actualizada
     * @throws ResponseStatusException si no existe, no es del solicitante, está cancelada
     *         o ya comenzó, o la nueva franja es inválida u ocupada
     */
    @Transactional
    public ReservaResumen modificar(Long idReserva, Long idUsuario, ReservaDatos.Modificacion datos) {
        Reserva reserva = buscar(idReserva);
        if (!reserva.getIdUsuario().equals(idUsuario)) {
            throw error(HttpStatus.FORBIDDEN, "Solo quien hizo la reserva puede modificarla.");
        }
        if (reserva.getEstado() == EstadoReserva.CANCELADA) {
            throw error(HttpStatus.CONFLICT, "Una reserva cancelada no se puede modificar.");
        }
        if (yaComenzo(reserva)) {
            throw error(HttpStatus.CONFLICT, "No se puede modificar una reserva que ya comenzó.");
        }

        Cancha cancha = canchas.buscarParaReservar(reserva.getIdCancha())
                .orElseThrow(() -> error(HttpStatus.NOT_FOUND, "La cancha no existe."));
        validarCanchaActiva(cancha);
        validarFranja(cancha, datos.fecha(), datos.horaInicio(), datos.horaFin());
        validarSinConflicto(cancha.getIdCancha(), datos.fecha(), datos.horaInicio(), datos.horaFin(),
                reserva.getIdReserva());

        reserva.setFecha(datos.fecha());
        reserva.setHoraInicio(datos.horaInicio());
        reserva.setHoraFin(datos.horaFin());
        reserva.setEstado(EstadoReserva.PENDIENTE);

        Reserva guardada = reservas.save(reserva);
        auditoria.save(new Auditoria("EDITAR_RESERVA", "Reserva " + guardada.getIdReserva()));
        return resumir(List.of(guardada)).get(0);
    }

    /**
     * Confirma una reserva pendiente. Solo quien administra el complejo.
     *
     * @param idReserva reserva a confirmar
     * @param idUsuario usuario solicitante
     * @param adminPlataforma si el solicitante es administrador de la plataforma
     * @return la reserva confirmada
     * @throws ResponseStatusException si no existe, el solicitante no administra el
     *         complejo o la reserva no está pendiente
     */
    @Transactional
    public ReservaResumen confirmar(Long idReserva, Long idUsuario, boolean adminPlataforma) {
        Reserva reserva = buscar(idReserva);
        Cancha cancha = buscarCancha(reserva.getIdCancha());
        verificarAdminComplejo(cancha.getIdComplejo(), idUsuario, adminPlataforma);
        if (reserva.getEstado() != EstadoReserva.PENDIENTE) {
            throw error(HttpStatus.CONFLICT, "Solo se puede confirmar una reserva pendiente.");
        }

        reserva.setEstado(EstadoReserva.CONFIRMADA);
        Reserva guardada = reservas.save(reserva);
        auditoria.save(new Auditoria("CONFIRMAR_RESERVA", "Reserva " + guardada.getIdReserva()));
        return resumir(List.of(guardada)).get(0);
    }

    /**
     * Cancela una reserva. Su dueño o quien administra el complejo.
     *
     * @param idReserva reserva a cancelar
     * @param idUsuario usuario solicitante
     * @param adminPlataforma si el solicitante es administrador de la plataforma
     * @return la reserva cancelada
     * @throws ResponseStatusException si no existe, el solicitante no tiene permiso, ya
     *         estaba cancelada o ya comenzó
     */
    @Transactional
    public ReservaResumen cancelar(Long idReserva, Long idUsuario, boolean adminPlataforma) {
        Reserva reserva = buscar(idReserva);
        Cancha cancha = buscarCancha(reserva.getIdCancha());
        boolean esDueno = reserva.getIdUsuario().equals(idUsuario);
        if (!esDueno && !puedeAdministrar(cancha.getIdComplejo(), idUsuario, adminPlataforma)) {
            throw error(HttpStatus.FORBIDDEN, "No tienes permiso para cancelar esta reserva.");
        }
        if (reserva.getEstado() == EstadoReserva.CANCELADA) {
            throw error(HttpStatus.CONFLICT, "La reserva ya está cancelada.");
        }
        if (yaComenzo(reserva)) {
            throw error(HttpStatus.CONFLICT, "No se puede cancelar una reserva que ya comenzó.");
        }

        reserva.setEstado(EstadoReserva.CANCELADA);
        Reserva guardada = reservas.save(reserva);
        auditoria.save(new Auditoria("CANCELAR_RESERVA", "Reserva " + guardada.getIdReserva()));
        return resumir(List.of(guardada)).get(0);
    }

    // ------------------------------------------------------------------ validaciones

    private void validarCanchaActiva(Cancha cancha) {
        if (!"ACTIVA".equals(cancha.getEstado())) {
            throw error(HttpStatus.CONFLICT, "La cancha no está disponible para reservas.");
        }
    }

    /** Hora válida, no pasada, dentro del horario del complejo y de exactamente una hora. */
    private void validarFranja(Cancha cancha, LocalDate fecha, LocalTime inicio, LocalTime fin) {
        if (!inicio.isBefore(fin)) {
            throw error(HttpStatus.BAD_REQUEST, "La hora de inicio debe ser menor a la hora de fin.");
        }
        if (!LocalDateTime.of(fecha, inicio).isAfter(LocalDateTime.now(ZONA))) {
            throw error(HttpStatus.BAD_REQUEST, "No se puede reservar en una fecha u hora pasada.");
        }

        HorarioDTO horario = horarios.obtenerHorarioDia(cancha.getIdComplejo(), fecha.getDayOfWeek())
                .orElseThrow(() -> error(HttpStatus.CONFLICT, "El complejo no atiende ese día."));
        if (inicio.isBefore(horario.horaApertura()) || fin.isAfter(horario.horaCierre())) {
            throw error(HttpStatus.CONFLICT, "La franja está fuera del horario de atención ("
                    + horario.horaApertura() + " - " + horario.horaCierre() + ").");
        }

        // Mismas franjas que genera la disponibilidad: bloques de 1 hora desde la apertura.
        boolean alineada = Duration.between(horario.horaApertura(), inicio).toMinutes() % 60 == 0;
        if (!alineada || !fin.equals(inicio.plusHours(1))) {
            throw error(HttpStatus.BAD_REQUEST,
                    "La reserva debe ser una franja de una hora, como las que muestra la disponibilidad.");
        }
    }

    private void validarSinConflicto(Long idCancha, LocalDate fecha, LocalTime inicio, LocalTime fin,
            Long excluirId) {
        if (reservas.contarConflictos(idCancha, fecha, inicio, fin, excluirId) > 0) {
            throw error(HttpStatus.CONFLICT, "Esa franja ya está reservada.");
        }
    }

    private boolean yaComenzo(Reserva reserva) {
        return !LocalDateTime.of(reserva.getFecha(), reserva.getHoraInicio())
                .isAfter(LocalDateTime.now(ZONA));
    }

    // ------------------------------------------------------------------ permisos

    private boolean puedeAdministrar(Long idComplejo, Long idUsuario, boolean adminPlataforma) {
        return adminPlataforma || administradores.existsByIdUsuarioAndIdComplejo(idUsuario, idComplejo);
    }

    private void verificarAdminComplejo(Long idComplejo, Long idUsuario, boolean adminPlataforma) {
        if (!puedeAdministrar(idComplejo, idUsuario, adminPlataforma)) {
            throw error(HttpStatus.FORBIDDEN, "No administras este complejo.");
        }
    }

    // ------------------------------------------------------------------ utilidades

    private Reserva buscar(Long idReserva) {
        return reservas.findById(idReserva)
                .orElseThrow(() -> error(HttpStatus.NOT_FOUND, "La reserva no existe."));
    }

    private Cancha buscarCancha(Long idCancha) {
        return canchas.findById(idCancha)
                .orElseThrow(() -> error(HttpStatus.NOT_FOUND, "La cancha no existe."));
    }

    /** Convierte reservas en DTOs resolviendo todas las canchas en una sola consulta. */
    private List<ReservaResumen> resumir(List<Reserva> lista) {
        if (lista.isEmpty()) {
            return List.of();
        }
        List<Long> ids = lista.stream().map(Reserva::getIdCancha).distinct().toList();
        Map<Long, Cancha> porId = canchas.findAllById(ids).stream()
                .collect(Collectors.toMap(Cancha::getIdCancha, c -> c));

        return lista.stream().map(r -> {
            Cancha c = porId.get(r.getIdCancha());
            return new ReservaResumen(r.getIdReserva(), r.getIdCancha(),
                    c != null ? c.getNombre() : "Cancha desconocida",
                    c != null ? c.getIdComplejo() : null,
                    r.getIdUsuario(), r.getFecha(), r.getHoraInicio(), r.getHoraFin(),
                    r.getEstado().name());
        }).toList();
    }

    private ResponseStatusException error(HttpStatus status, String mensaje) {
        return new ResponseStatusException(status, mensaje);
    }
}