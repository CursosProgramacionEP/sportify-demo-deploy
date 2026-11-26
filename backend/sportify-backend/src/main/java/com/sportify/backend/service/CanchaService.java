package com.sportify.backend.service;

import com.sportify.backend.dto.HorarioDTO;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import com.sportify.backend.dto.CanchaCatalogoDTO;
import com.sportify.backend.dto.SlotDisponibilidadDTO;
import com.sportify.backend.model.Auditoria;
import com.sportify.backend.model.Cancha;
import com.sportify.backend.model.Complejo;
import com.sportify.backend.repository.AuditoriaRepository;
import com.sportify.backend.repository.CanchaRepository;
import com.sportify.backend.repository.ComplejoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.sportify.backend.dto.BloqueHorarioDTO;
import java.time.LocalDateTime;
import java.time.ZoneId;

/**
 * Coordina la lógica de negocio para la gestión de canchas deportivas.
 * 
 * @author Equipo Sportify
 */
@Service
public class CanchaService {

    private final CanchaRepository canchaRepository;
    private final ComplejoRepository complejoRepository;
    private final AuditoriaRepository auditoriaRepository;
    private final ConsultaHorarios consultaHorarios;
    private final ConsultaReservas consultaReservas;

    private static final DateTimeFormatter FORMATO_HORA = DateTimeFormatter.ofPattern("HH:mm");
    private static final ZoneId ZONA = ZoneId.of("America/Lima");

    public CanchaService(CanchaRepository canchaRepository, ComplejoRepository complejoRepository,
            AuditoriaRepository auditoriaRepository, ConsultaHorarios consultaHorarios,
            ConsultaReservas consultaReservas) {
        this.canchaRepository = canchaRepository;
        this.complejoRepository = complejoRepository;
        this.auditoriaRepository = auditoriaRepository;
        this.consultaHorarios = consultaHorarios;
        this.consultaReservas = consultaReservas;
    }

    /**
     * Lista todas las canchas de un complejo.
     * 
     * @param idComplejo Identificador del complejo.
     * @return Lista de canchas.
     */
    public List<Cancha> listarPorComplejo(Long idComplejo) {
        return canchaRepository.findByIdComplejo(idComplejo);
    }

    /**
     * Registra una nueva cancha validando que el complejo exista y que el nombre no
     * esté duplicado.
     * 
     * @param idComplejo Identificador del complejo.
     * @param cancha     Datos de la cancha a registrar.
     * @return La cancha guardada en la BD.
     * @throws ResponseStatusException si hay errores de validación.
     */
    @Transactional
    public Cancha registrar(Long idComplejo, Cancha cancha) {
        if (!complejoRepository.existsById(idComplejo)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "El complejo no existe.");
        }
        if (canchaRepository.existsByIdComplejoAndNombre(idComplejo, cancha.getNombre())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe una cancha con ese nombre en este complejo.");
        }

        cancha.setIdComplejo(idComplejo);
        Cancha guardada = canchaRepository.save(cancha);

        auditoriaRepository.save(new Auditoria("CREAR_CANCHA", "Se agregó la cancha " + guardada.getNombre()));
        return guardada;
    }

    /**
     * Actualiza los datos de una cancha existente.
     * 
     * @param id    Identificador de la cancha.
     * @param datos Nuevos datos a aplicar.
     * @return La cancha actualizada.
     * @throws ResponseStatusException si la cancha no existe.
     */
    @Transactional
    public Cancha modificar(Long id, Cancha datos) {
        Cancha cancha = canchaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cancha no encontrada."));

        cancha.setNombre(datos.getNombre());
        cancha.setPrecioHora(datos.getPrecioHora());
        cancha.setCapacidad(datos.getCapacidad());
        cancha.setEstado(datos.getEstado());

        Cancha guardada = canchaRepository.save(cancha);
        auditoriaRepository.save(new Auditoria("EDITAR_CANCHA", "Se actualizó la cancha " + guardada.getNombre()));
        return guardada;
    }

    /**
     * Cambia el estado (ACTIVA/INACTIVA) de una cancha.
     * 
     * @param id     Identificador de la cancha.
     * @param estado Nuevo estado.
     * @return La cancha actualizada.
     */
    @Transactional
    public Cancha cambiarEstado(Long id, String estado) {
        Cancha cancha = canchaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cancha no encontrada."));

        cancha.setEstado(estado);
        Cancha guardada = canchaRepository.save(cancha);

        String accion = "ACTIVA".equalsIgnoreCase(estado) ? "ACTIVAR_CANCHA" : "DESACTIVAR_CANCHA";
        auditoriaRepository.save(new Auditoria(accion, "Cancha " + guardada.getNombre()));
        return guardada;
    }

    /**
     * Lista las canchas activas con los datos de su complejo, para el catálogo del
     * cliente.
     * Resuelve todos los complejos en una sola consulta para evitar N+1.
     *
     * @return canchas activas; lista vacía si no hay ninguna
     */
    public List<CanchaCatalogoDTO> listarCatalogo() {
        List<Cancha> canchas = canchaRepository.findByEstado("ACTIVA");
        if (canchas.isEmpty()) {
            return List.of();
        }

        List<Long> idsComplejos = canchas.stream()
                .map(Cancha::getIdComplejo)
                .distinct()
                .toList();

        Map<Long, Complejo> complejosPorId = complejoRepository.findAllById(idsComplejos).stream()
                .collect(Collectors.toMap(Complejo::getIdComplejo, c -> c));

        return canchas.stream().map(c -> {
            Complejo comp = complejosPorId.get(c.getIdComplejo());
            return new CanchaCatalogoDTO(
                    c.getIdCancha(),
                    c.getNombre(),
                    c.getPrecioHora(),
                    c.getCapacidad(),
                    c.getEstado(),
                    c.getIdComplejo(),
                    comp != null ? comp.getNombre() : "Complejo desconocido",
                    comp != null ? comp.getDireccion() : "");
        }).toList();
    }

    /**
     * Genera las franjas de una hora de una cancha para una fecha, según el horario
     * real
     * del complejo. Una franja queda no disponible si ya hay una reserva activa que
     * se
     * cruza con ella o si su hora de inicio ya pasó.
     *
     * @param idCancha identificador de la cancha
     * @param fechaStr fecha en formato ISO {@code YYYY-MM-DD}
     * @return franjas del día; lista vacía si la cancha está inactiva o el complejo
     *         no abre
     * @throws ResponseStatusException si la cancha no existe o la fecha es inválida
     */
    public List<SlotDisponibilidadDTO> obtenerDisponibilidad(Long idCancha, String fechaStr) {
        Cancha cancha = canchaRepository.findById(idCancha)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "La cancha no existe."));

        LocalDate fecha;
        try {
            fecha = LocalDate.parse(fechaStr);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Formato de fecha inválido. Usa YYYY-MM-DD.");
        }
        if (!"ACTIVA".equals(cancha.getEstado())) {
            return List.of();
        }

        // Las horas salen del horario real del complejo para ese día de la semana.
        // Si el complejo no abre ese día (o aún no configuró su horario), no hay
        // franjas.
        Optional<HorarioDTO> horario = consultaHorarios.obtenerHorarioDia(cancha.getIdComplejo(), fecha.getDayOfWeek());
        if (horario.isEmpty()) {
            return List.of();
        }

        List<BloqueHorarioDTO> ocupados = consultaReservas.bloquesOcupados(idCancha, fecha);
        LocalDateTime ahora = LocalDateTime.now(ZONA);

        List<SlotDisponibilidadDTO> slots = new ArrayList<>();
        LocalTime inicio = horario.get().horaApertura();
        LocalTime cierre = horario.get().horaCierre();
        LocalTime fin = inicio.plusHours(1);
        // fin.isAfter(inicio) evita que una franja cercana a medianoche "dé la vuelta".
        while (fin.isAfter(inicio) && !fin.isAfter(cierre)) {
            final LocalTime desde = inicio;
            final LocalTime hasta = fin;
            boolean ocupada = ocupados.stream()
                    .anyMatch(b -> b.horaInicio().isBefore(hasta) && b.horaFin().isAfter(desde));
            boolean pasada = !LocalDateTime.of(fecha, desde).isAfter(ahora);
            slots.add(new SlotDisponibilidadDTO(desde.format(FORMATO_HORA), hasta.format(FORMATO_HORA),
                    !ocupada && !pasada));
            inicio = fin;
            fin = inicio.plusHours(1);
        }
        return slots;
    }
}