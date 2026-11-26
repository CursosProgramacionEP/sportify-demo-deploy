package com.sportify.backend.service;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import com.sportify.backend.dto.EquipoDatos;
import com.sportify.backend.dto.EquipoResumen;
import com.sportify.backend.model.Equipo;
import com.sportify.backend.model.EquipoJugador;
import com.sportify.backend.model.NivelEquipo;
import com.sportify.backend.repository.EquipoJugadorRepository;
import com.sportify.backend.repository.EquipoRepository;
import com.sportify.backend.repository.UsuarioRepository;
import org.springframework.transaction.annotation.Transactional;

/**
 * Coordina la creación, consulta y edición de equipos, así como los límites
 * de creación y pertenencia por usuario.
 *
 * @author Equipo Sportify
 */
@Service
@Transactional(readOnly = true)
public class EquipoService {
    private static final int MAX_EQUIPOS_CREADOS = 3;
    private static final int MAX_EQUIPOS_ACTIVOS = 5;

    private final UsuarioRepository usuarios;
    private final EquipoRepository equipos;
    private final EquipoJugadorRepository miembros;

    public EquipoService(UsuarioRepository usuarios, EquipoRepository equipos, EquipoJugadorRepository miembros) {
        this.usuarios = usuarios;
        this.equipos = equipos;
        this.miembros = miembros;
    }

    /**
     * Crea un equipo nuevo y registra al creador como capitán del plantel.
     * Valida usuario activo, límite de 3 creados, límite de 5 activos y nombre único por capitán.
     *
     * @param idUsuario capitán solicitante
     * @param datos nombre y nivel validados
     * @return equipo persistido con su total de jugadores
     * @throws ResponseStatusException si el usuario no está activo o se supera algún límite
     */
    @Transactional
    public EquipoResumen crear(Long idUsuario, EquipoDatos.Creacion datos) {
        validarUsuarioActivo(idUsuario);
        if (equipos.countByIdUsuarioResponsable(idUsuario) >= MAX_EQUIPOS_CREADOS) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya creaste el máximo de " + MAX_EQUIPOS_CREADOS + " equipos permitidos.");
        }
        if (miembros.countEquiposActivosPorUsuario(idUsuario) >= MAX_EQUIPOS_ACTIVOS) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya perteneces al máximo de " + MAX_EQUIPOS_ACTIVOS + " equipos activos.");
        }
        String nombre = datos.nombre().trim();
        if (equipos.existsByNombreIgnoreCaseAndIdUsuarioResponsable(nombre, idUsuario)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya tienes un equipo con ese nombre.");
        }
        Equipo equipo = equipos.save(new Equipo(idUsuario, nombre, parseNivel(datos.nivel())));
        miembros.save(new EquipoJugador(equipo.getIdEquipo(), idUsuario, "CAPITAN"));
        return resumen(equipo);
    }

    /**
     * Lista los equipos donde el usuario es miembro, sea capitán o jugador.
     *
     * @param idUsuario usuario consultado
     * @return equipos del usuario; lista vacía si no pertenece a ninguno
     * @throws ResponseStatusException si el usuario no está activo
     */
    public List<EquipoResumen> listarMios(Long idUsuario) {
        validarUsuarioActivo(idUsuario);
        List<Long> ids = miembros.findByIdUsuario(idUsuario).stream() .map(EquipoJugador::getIdEquipo).toList();
        return equipos.findAllById(ids).stream().map(this::resumen).toList();
    }

    /**
     * Consulta un equipo validando que el solicitante sea miembro.
     *
     * @param idEquipo identificador del equipo
     * @param idUsuario solicitante
     * @return equipo con su total de jugadores
     * @throws ResponseStatusException si no existe o no es miembro
     */
    public EquipoResumen obtener(Long idEquipo, Long idUsuario) {
        Equipo equipo = buscarEquipo(idEquipo);
        verificarMiembro(idEquipo, idUsuario);
        return resumen(equipo);
    }

    /**
     * Actualiza el nombre del equipo. Solo el capitán y nombre único por capitán.
     *
     * @param idEquipo identificador del equipo
     * @param idUsuario capitán solicitante
     * @param datos nuevo nombre validado
     * @return equipo actualizado
     * @throws ResponseStatusException si no existe, no es capitán o el nombre está repetido
     */
    @Transactional
    public EquipoResumen editar(Long idEquipo, Long idUsuario, EquipoDatos.Edicion datos) {
        Equipo equipo = buscarEquipo(idEquipo);
        verificarCapitan(equipo, idUsuario);
        String nombre = datos.nombre().trim();
        if (equipos.existsByNombreIgnoreCaseAndIdUsuarioResponsableAndIdEquipoNot(nombre, idUsuario, idEquipo)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya tienes otro equipo con ese nombre.");
        }
        equipo.setNombre(nombre);
        return resumen(equipos.save(equipo));
    }

    /**
     * Cambia el nivel del equipo. Solo el capitán.
     *
     * @param idEquipo identificador del equipo
     * @param idUsuario capitán solicitante
     * @param nivel nuevo nivel como texto
     * @return equipo actualizado
     * @throws ResponseStatusException si no existe, no es capitán o el nivel es inválido
     */
    @Transactional
    public EquipoResumen cambiarNivel(Long idEquipo, Long idUsuario, String nivel) {
        Equipo equipo = buscarEquipo(idEquipo);
        verificarCapitan(equipo, idUsuario);
        equipo.setNivel(parseNivel(nivel));
        return resumen(equipos.save(equipo));
    }

    /**
     * Activa o desactiva el equipo. Al reactivar, verifica que todos los miembros
     * puedan volver a contar el equipo dentro de su límite de 5 activos.
     *
     * @param idEquipo identificador del equipo
     * @param idUsuario capitán solicitante
     * @param estado ACTIVO o INACTIVO
     * @return equipo actualizado
     * @throws ResponseStatusException si no existe, no es capitán, el estado es inválido
     *         o algún miembro supera el límite de equipos activos
     */
    @Transactional
    public EquipoResumen cambiarEstado(Long idEquipo, Long idUsuario, String estado) {
        Equipo equipo = buscarEquipo(idEquipo);
        verificarCapitan(equipo, idUsuario);
        if (!"ACTIVO".equals(estado) && !"INACTIVO".equals(estado)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estado inválido.");
        }
        if ("ACTIVO".equals(estado) && !"ACTIVO".equals(equipo.getEstado())) {
            for (EquipoJugador miembro : miembros.findByIdEquipo(idEquipo)) {
                if (miembros.countEquiposActivosPorUsuario(miembro.getIdUsuario()) >= MAX_EQUIPOS_ACTIVOS) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT,
                            "Un miembro del equipo ya alcanzó el máximo de equipos activos.");
                }
            }
        }
        equipo.setEstado(estado);
        return resumen(equipos.save(equipo));
    }

    /**
     * Transfiere la capitanía a otro miembro del equipo. El capitán anterior
     * queda como JUGADOR y el nuevo miembro pasa a CAPITAN.
     *
     * @param idEquipo identificador del equipo
     * @param idUsuario capitán actual
     * @param idNuevoCapitan miembro que asume la capitanía
     * @return equipo actualizado
     * @throws ResponseStatusException si no existe, no es capitán, se apunta a sí mismo
     *         o el nuevo capitán no pertenece al equipo
     */
    @Transactional
    public EquipoResumen transferirCapitan(Long idEquipo, Long idUsuario, Long idNuevoCapitan) {
        Equipo equipo = buscarEquipo(idEquipo);
        verificarCapitan(equipo, idUsuario);
        if (idUsuario.equals(idNuevoCapitan)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ya eres el capitán del equipo.");
        }
        EquipoJugador nuevo = miembros.findByIdEquipoAndIdUsuario(idEquipo, idNuevoCapitan)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "El usuario indicado no pertenece al equipo."));
        EquipoJugador actual = miembros.findByIdEquipoAndIdUsuario(idEquipo, idUsuario)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT,
                        "El capitán no figura como miembro del equipo."));
        actual.setRolEquipo("JUGADOR");
        nuevo.setRolEquipo("CAPITAN");
        miembros.save(actual);
        miembros.save(nuevo);
        equipo.setIdUsuarioResponsable(idNuevoCapitan);
        return resumen(equipos.save(equipo));
    }

    private void validarUsuarioActivo(Long idUsuario) {
        var usuario = usuarios.findById(idUsuario).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "El usuario no existe."));
        if (!"ACTIVO".equals(usuario.getEstado())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La cuenta no está activa.");
        }
    }

    private Equipo buscarEquipo(Long idEquipo) {
        return equipos.findById(idEquipo).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "El equipo no existe."));
    }

    private void verificarCapitan(Equipo equipo, Long idUsuario) {
        if (!equipo.getIdUsuarioResponsable().equals(idUsuario)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Solo el capitán puede realizar esta acción.");
        }
    }

    private void verificarMiembro(Long idEquipo, Long idUsuario) {
        if (!miembros.existsByIdEquipoAndIdUsuario(idEquipo, idUsuario)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No perteneces a este equipo.");
        }
    }

    private NivelEquipo parseNivel(String nivel) {
        try {
            return NivelEquipo.valueOf(nivel);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nivel inválido.");
        }
    }

    private EquipoResumen resumen(Equipo equipo) {
        long total = miembros.countByIdEquipo(equipo.getIdEquipo());
        return new EquipoResumen(equipo.getIdEquipo(), equipo.getIdUsuarioResponsable(),
                equipo.getNombre(), equipo.getNivel().name(), equipo.getEstado(),
                equipo.getFechaCreacion(), total);
    }
}
