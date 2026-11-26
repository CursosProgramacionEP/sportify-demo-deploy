package com.sportify.backend.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import com.sportify.backend.dto.JugadorResumen;
import com.sportify.backend.model.Equipo;
import com.sportify.backend.model.EquipoJugador;
import com.sportify.backend.model.Usuario;
import com.sportify.backend.repository.EquipoJugadorRepository;
import com.sportify.backend.repository.EquipoRepository;
import com.sportify.backend.repository.UsuarioRepository;
import org.springframework.transaction.annotation.Transactional;
import com.sportify.backend.dto.UsuarioBuscadoResumen;    


/**
 * Gestiona el plantel de cada equipo: listar, agregar y retirar jugadores.
 * Solo el capitán modifica el plantel; cualquier miembro puede consultarlo.
 *
 * @author Equipo Sportify
 */
@Service
@Transactional(readOnly = true)
public class EquipoJugadorService {

    private static final int MAX_JUGADORES = 20;
    private static final int MAX_EQUIPOS_ACTIVOS = 5;

    private final UsuarioRepository usuarios;
    private final EquipoRepository equipos;
    private final EquipoJugadorRepository miembros;

    public EquipoJugadorService(UsuarioRepository usuarios, EquipoRepository equipos,
            EquipoJugadorRepository miembros) {
        this.usuarios = usuarios;
        this.equipos = equipos;
        this.miembros = miembros;
    }

    /**
     * Lista el plantel del equipo. Cualquier miembro puede consultarlo.
     *
     * @param idEquipo identificador del equipo
     * @param idUsuario solicitante
     * @return miembros del equipo con datos legibles, o lista vacía
     * @throws ResponseStatusException si el equipo no existe o el solicitante no es miembro
     */
    public List<JugadorResumen> listar(Long idEquipo, Long idUsuario) {
        buscarEquipo(idEquipo);
        verificarMiembro(idEquipo, idUsuario);
        List<EquipoJugador> plantel = miembros.findByIdEquipo(idEquipo);
        List<Long> ids = plantel.stream().map(EquipoJugador::getIdUsuario).toList();
        Map<Long, Usuario> porId = usuarios.findAllById(ids).stream()
                .collect(Collectors.toMap(Usuario::getIdUsuario, u -> u));
        return plantel.stream().map(ej -> resumen(ej, porId.get(ej.getIdUsuario()))).toList();
    }

    /**
     * Agrega un jugador al plantel. Solo el capitán, equipo ACTIVO, sin duplicados
     * y respetando los máximos de 20 jugadores y 5 equipos activos por usuario.
     *
     * @param idEquipo identificador del equipo
     * @param idUsuario capitán solicitante
     * @param idNuevo identificador del usuario a agregar
     * @return miembro agregado
     * @throws ResponseStatusException si no es capitán, el equipo está inactivo,
     *         se superan límites o el usuario no es válido
     */
    @Transactional
    public JugadorResumen agregar(Long idEquipo, Long idUsuario, Long idNuevo) {
        Equipo equipo = buscarEquipo(idEquipo);
        verificarCapitan(equipo, idUsuario);
        if (!"ACTIVO".equals(equipo.getEstado())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El equipo está inactivo.");
        }
        if (miembros.countByIdEquipo(idEquipo) >= MAX_JUGADORES) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "El equipo alcanzó el máximo de " + MAX_JUGADORES + " jugadores.");
        }
        Usuario nuevo = usuarios.findById(idNuevo).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "El usuario no existe."));
        if (!"ACTIVO".equals(nuevo.getEstado())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La cuenta del jugador no está activa.");
        }
        if (miembros.existsByIdEquipoAndIdUsuario(idEquipo, idNuevo)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El usuario ya pertenece al equipo.");
        }
        if (miembros.countEquiposActivosPorUsuario(idNuevo) >= MAX_EQUIPOS_ACTIVOS) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "El jugador ya alcanzó el máximo de " + MAX_EQUIPOS_ACTIVOS + " equipos activos.");
        }
        EquipoJugador miembro = new EquipoJugador(idEquipo, idNuevo, "JUGADOR");
        miembros.save(miembro);
        return resumen(miembro, nuevo);
    }

    /**
     * Retira un jugador del plantel. Solo el capitán, equipo ACTIVO y no se
     * puede retirar al capitán. La cuenta del jugador no se elimina.
     *
     * @param idEquipo identificador del equipo
     * @param idUsuario capitán solicitante
     * @param idRetirar identificador del jugador a retirar
     * @throws ResponseStatusException si no es capitán, el equipo está inactivo,
     *         intenta retirarse a sí mismo o el jugador no pertenece al equipo
     */
    @Transactional
    public void retirar(Long idEquipo, Long idUsuario, Long idRetirar) {
        Equipo equipo = buscarEquipo(idEquipo);
        verificarCapitan(equipo, idUsuario);
        if (!"ACTIVO".equals(equipo.getEstado())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El equipo está inactivo.");
        }
        if (idUsuario.equals(idRetirar)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "El capitán no puede retirarse; transfiere la capitanía o desactiva el equipo.");
        }
        EquipoJugador miembro = miembros.findByIdEquipoAndIdUsuario(idEquipo, idRetirar)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "El usuario no pertenece al equipo."));
        miembros.delete(miembro);
    }

    /**
     * Busca un usuario activo por correo exacto. Solo capitanes de algún equipo
     * pueden invocarlo. Devuelve datos mínimos para confirmar identidad antes
     * de agregarlo al plantel.
     *
     * @param idSolicitante capitán autenticado
     * @param correo correo exacto del usuario buscado
     * @return datos mínimos del usuario encontrado
     * @throws ResponseStatusException si el solicitante no es capitán, el correo
     *         no existe o la cuenta no está activa
     */
    public UsuarioBuscadoResumen buscarJugador(Long idSolicitante, String correo) {
        if (!equipos.existsByIdUsuarioResponsable(idSolicitante)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo los capitanes pueden buscar jugadores.");
        }
        Usuario encontrado = usuarios.findByCorreoIgnoreCase(correo.trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No existe un usuario con ese correo."));
        if (!"ACTIVO".equals(encontrado.getEstado())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "No existe un usuario activo con ese correo.");
        }
        return new UsuarioBuscadoResumen(
                encontrado.getIdUsuario(), encontrado.getNombres(),
                encontrado.getApellidos(), encontrado.getCorreo());
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

    private JugadorResumen resumen(EquipoJugador ej, Usuario u) {
        return new JugadorResumen(ej.getIdUsuario(), u.getNombres(), u.getApellidos(),
                u.getCorreo(), ej.getRolEquipo(), ej.getFechaIngreso());
    }
}
