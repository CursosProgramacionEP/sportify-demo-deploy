package com.sportify.backend.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.sportify.backend.dto.PartidoDatos;
import com.sportify.backend.dto.PartidoResumen;
import com.sportify.backend.model.Equipo;
import com.sportify.backend.model.Partido;
import com.sportify.backend.repository.EquipoJugadorRepository;
import com.sportify.backend.repository.EquipoRepository;
import com.sportify.backend.repository.PartidoRepository;

/**
 * Registra, edita, elimina y consulta el historial de partidos de un equipo.
 * Solo el capitán modifica; cualquier miembro consulta. Equipo inactivo = solo consulta.
 *
 * @author Equipo Sportify
 */
@Service
@Transactional(readOnly = true)
public class PartidoService {
    private final EquipoRepository equipos;
    private final EquipoJugadorRepository miembros;
    private final PartidoRepository partidos;

    public PartidoService(EquipoRepository equipos, EquipoJugadorRepository miembros,
            PartidoRepository partidos) {
        this.equipos = equipos;
        this.miembros = miembros;
        this.partidos = partidos;
    }

    /**
     * Lista el historial del equipo ordenado por fecha descendente.
     * Cualquier miembro puede consultarlo, incluso si el equipo está inactivo.
     *
     * @param idEquipo identificador del equipo
     * @param idUsuario solicitante
     * @return partidos del equipo con resultado calculado
     * @throws ResponseStatusException si el equipo no existe o el solicitante no es miembro
     */
    public List<PartidoResumen> listar(Long idEquipo, Long idUsuario) {
        buscarEquipo(idEquipo);
        verificarMiembro(idEquipo, idUsuario);
        return partidos.findByIdEquipoOrderByFechaDesc(idEquipo).stream()
                .map(this::resumen)
                .toList();
    }

    /**
     * Registra un partido. Solo el capitán, equipo ACTIVO, fecha no futura y goles >= 0.
     *
     * @param idEquipo identificador del equipo
     * @param idUsuario capitán solicitante
     * @param datos datos validados del partido
     * @return partido persistido con resultado calculado
     * @throws ResponseStatusException si no es capitán o el equipo está inactivo
     */
    @Transactional
    public PartidoResumen registrar(Long idEquipo, Long idUsuario, PartidoDatos.Registro datos) {
        Equipo equipo = buscarEquipo(idEquipo);
        verificarCapitan(equipo, idUsuario);
        verificarEquipoActivo(equipo);
        Partido partido = new Partido(idEquipo, datos.fecha(), datos.rival().trim(),
                datos.golesFavor(), datos.golesContra(), datos.observaciones(), idUsuario);
        return resumen(partidos.save(partido));
    }

    /**
     * Edita un partido existente. Solo el capitán, equipo ACTIVO y partido del equipo.
     *
     * @param idEquipo identificador del equipo
     * @param idPartido identificador del partido
     * @param idUsuario capitán solicitante
     * @param datos datos validados del partido
     * @return partido actualizado con resultado calculado
     * @throws ResponseStatusException si no es capitán, el equipo está inactivo
     *         o el partido no pertenece al equipo
     */
    @Transactional
    public PartidoResumen editar(Long idEquipo, Long idPartido, Long idUsuario, PartidoDatos.Edicion datos) {
        Equipo equipo = buscarEquipo(idEquipo);
        verificarCapitan(equipo, idUsuario);
        verificarEquipoActivo(equipo);
        Partido partido = buscarPartidoDelEquipo(idEquipo, idPartido);
        partido.setFecha(datos.fecha());
        partido.setRival(datos.rival().trim());
        partido.setGolesFavor(datos.golesFavor());
        partido.setGolesContra(datos.golesContra());
        partido.setObservaciones(datos.observaciones());
        return resumen(partidos.save(partido));
    }

    /**
     * Elimina un partido. Solo el capitán, equipo ACTIVO y partido del equipo.
     *
     * @param idEquipo identificador del equipo
     * @param idPartido identificador del partido
     * @param idUsuario capitán solicitante
     * @throws ResponseStatusException si no es capitán, el equipo está inactivo
     *         o el partido no pertenece al equipo
     */
    @Transactional
    public void eliminar(Long idEquipo, Long idPartido, Long idUsuario) {
        Equipo equipo = buscarEquipo(idEquipo);
        verificarCapitan(equipo, idUsuario);
        verificarEquipoActivo(equipo);
        Partido partido = buscarPartidoDelEquipo(idEquipo, idPartido);
        partidos.delete(partido);
    }

    private Equipo buscarEquipo(Long idEquipo) {
        return equipos.findById(idEquipo).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "El equipo no existe."));
    }

    private Partido buscarPartidoDelEquipo(Long idEquipo, Long idPartido) {
        Partido partido = partidos.findById(idPartido).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "El partido no existe."));
        if (!partido.getIdEquipo().equals(idEquipo)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "El partido no pertenece a este equipo.");
        }
        return partido;
    }

    private void verificarCapitan(Equipo equipo, Long idUsuario) {
        if (!equipo.getIdUsuarioResponsable().equals(idUsuario)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Solo el capitán puede realizar esta acción.");
        }
    }

    private void verificarEquipoActivo(Equipo equipo) {
        if (!"ACTIVO".equals(equipo.getEstado())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "El equipo está inactivo; no se pueden modificar sus partidos.");
        }
    }

    private void verificarMiembro(Long idEquipo, Long idUsuario) {
        if (!miembros.existsByIdEquipoAndIdUsuario(idEquipo, idUsuario)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No perteneces a este equipo.");
        }
    }

    private PartidoResumen resumen(Partido p) {
        return new PartidoResumen(p.getIdPartido(), p.getIdEquipo(), p.getFecha(), p.getRival(),
                p.getGolesFavor(), p.getGolesContra(), p.getObservaciones(), calcularResultado(p));
    }

    private String calcularResultado(Partido p) {
        int favor = p.getGolesFavor();
        int contra = p.getGolesContra();
        if (favor > contra) return "VICTORIA";
        if (favor < contra) return "DERROTA";
        return "EMPATE";
    }
}
