package com.sportify.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.sportify.backend.model.AdministradorComplejo;
import com.sportify.backend.model.AdministradorComplejoId;
import com.sportify.backend.model.Auditoria;
import com.sportify.backend.model.Rol;
import com.sportify.backend.model.UsuarioRol;
import com.sportify.backend.repository.AdministradorComplejoRepository;
import com.sportify.backend.repository.AuditoriaRepository;
import com.sportify.backend.repository.ComplejoRepository;
import com.sportify.backend.repository.RolRepository;
import com.sportify.backend.repository.UsuarioRepository;
import com.sportify.backend.repository.UsuarioRolRepository;

/**
 * Mantiene las asociaciones de usuarios con complejos y el rol compartido ADMIN_COMPLEJO.
 *
 * @author Equipo Sportify
 */
@Service
public class AdministradorComplejoService {
    private final UsuarioRepository usuarioRepository;
    private final ComplejoRepository complejoRepository;
    private final AdministradorComplejoRepository administradorComplejoRepository;
    private final UsuarioRolRepository usuarioRolRepository;
    private final RolRepository rolRepository;
    private final AuditoriaRepository auditoriaRepository;


    /**
     * Recibe las dependencias que utiliza esta capa para ejecutar sus operaciones.
     *
     * @param usuarioRepository repositorio de usuarios registrados
     * @param complejoRepository repositorio de complejos deportivos
     * @param administradorComplejoRepository repositorio de asociaciones usuario-complejo
     * @param usuarioRolRepository repositorio de asignaciones de roles
     * @param rolRepository repositorio de roles disponibles
     */
    public AdministradorComplejoService(UsuarioRepository usuarioRepository, ComplejoRepository complejoRepository,
            AdministradorComplejoRepository administradorComplejoRepository, UsuarioRolRepository usuarioRolRepository,
            RolRepository rolRepository, AuditoriaRepository auditoriaRepository) {
        this.usuarioRepository = usuarioRepository;
        this.complejoRepository = complejoRepository;
        this.administradorComplejoRepository = administradorComplejoRepository;
        this.usuarioRolRepository = usuarioRolRepository;
        this.rolRepository = rolRepository;
        this.auditoriaRepository=auditoriaRepository;
    }

    /**
     * Consulta asociaciones sin exigir que exista previamente el complejo.
     *
     * @param idComplejo identificador del complejo consultado
     * @return asociaciones existentes o lista vacía si no hay coincidencias
     */
    public List <AdministradorComplejo> listarAdministradores(Long idComplejo){
        return  administradorComplejoRepository.findByIdComplejo(idComplejo);
    }

    /**
     * Comprueba usuario, complejo y duplicados; asigna ADMIN_COMPLEJO si hace falta y guarda la asociación.
     *
     * @param idComplejo identificador del complejo
     * @param idUsuario identificador del usuario
     * @return asociación persistida
     * @throws RuntimeException si falta el usuario, el complejo o el rol ADMIN_COMPLEJO, o la asociación ya existe
     */
    @Transactional
    public AdministradorComplejo asociarAdministrador(Long idComplejo, Long idUsuario) {

    if (idUsuario == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecciona un usuario.");
    var usuario = usuarioRepository.findById(idUsuario).orElseThrow(() ->
        new ResponseStatusException(HttpStatus.NOT_FOUND, "El usuario no existe."));
    if (!"ACTIVO".equals(usuario.getEstado()))
        throw new ResponseStatusException(HttpStatus.CONFLICT, "Activa la cuenta antes de asignarle un complejo.");

    if (!complejoRepository.existsById(idComplejo))
        throw new RuntimeException("El complejo no existe");

    if (administradorComplejoRepository.existsByIdUsuarioAndIdComplejo(idUsuario, idComplejo))
        throw new RuntimeException("El usuario ya es administrador de este complejo");

    Rol rol = rolRepository.findByNombre("ADMIN_COMPLEJO")
            .orElseThrow(() -> new RuntimeException("El rol ADMIN_COMPLEJO no existe"));

    if (usuarioRolRepository.findByIdUsuarioAndIdRol(idUsuario, rol.getIdRol()).isEmpty())
        usuarioRolRepository.save(new UsuarioRol(idUsuario, rol.getIdRol()));
    
    AdministradorComplejo guardado = administradorComplejoRepository.save(new AdministradorComplejo(idUsuario, idComplejo));
    String nombreComplejo = complejoRepository.findById(idComplejo).map(c -> c.getNombre()).orElse("Desconocido");
    String nombreUsuario = usuario.getNombres() + " " + usuario.getApellidos();
    auditoriaRepository.save(new Auditoria("ASIGNAR_ADMIN", "Se asignó a " + nombreUsuario + " al complejo " + nombreComplejo));
        return guardado;
}

    /**
     * Retira la asociación y elimina ADMIN_COMPLEJO cuando el usuario deja de administrar complejos.
     *
     * @param idComplejo identificador del complejo
     * @param idUsuario identificador del usuario
     * @return true si se retiró la asociación; false si no existía
     * @throws RuntimeException si se necesita retirar el rol y ADMIN_COMPLEJO no existe
     */
    @Transactional
    public boolean eliminarAdministrador(Long idComplejo, Long idUsuario) {
    if (!administradorComplejoRepository.existsByIdUsuarioAndIdComplejo(idUsuario, idComplejo)) {
        return false;
    }
    AdministradorComplejoId id =new AdministradorComplejoId(idUsuario, idComplejo);
    administradorComplejoRepository.deleteById(id);

    if (administradorComplejoRepository.findByIdUsuario(idUsuario).isEmpty()) {

        Rol rol = rolRepository.findByNombre("ADMIN_COMPLEJO")
                .orElseThrow(() ->new RuntimeException("El rol ADMIN_COMPLEJO no existe"));

        usuarioRolRepository.findByIdUsuarioAndIdRol(idUsuario, rol.getIdRol()).ifPresent(usuarioRol ->
                        usuarioRolRepository.delete(usuarioRol));
    }

        String nombreComplejo = complejoRepository.findById(idComplejo).map(c -> c.getNombre()).orElse("Desconocido");
        String nombreUsuario = usuarioRepository.findById(idUsuario).map(u -> u.getNombres() + " " + u.getApellidos()).orElse("Desconocido");
        auditoriaRepository.save(new Auditoria("QUITAR_ADMIN", "Se quitó a " + nombreUsuario + " del complejo " + nombreComplejo));
    return true;
}

    public List<AdministradorComplejo> listarTodos() {
        return administradorComplejoRepository.findAll();
    }

        /**
     * Recupera todas las asociaciones de administración que pertenecen a un usuario específico.
     * <p>
     * Este método es utilizado principalmente por el Administrador del Complejo para
     * saber cuál es la sede que le corresponde gestionar (endpoint {@code GET /api/complejos/mio}).
     * 
     * @param idUsuario Identificador único del usuario (administrador).
     * @return Una lista con las asociaciones del usuario. Si el usuario no administra
     *         ningún complejo, se devuelve una lista vacía.
     */
    public List<AdministradorComplejo> listarPorUsuario(Long idUsuario) {
        return administradorComplejoRepository.findByIdUsuario(idUsuario);
    }
}
