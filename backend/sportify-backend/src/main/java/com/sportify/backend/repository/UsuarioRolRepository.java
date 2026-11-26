package com.sportify.backend.repository;

import com.sportify.backend.model.UsuarioRol;
import com.sportify.backend.model.UsuarioRolId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

/**
 * Consulta asignaciones de roles usando la clave compuesta de usuario y rol.
 *
 * @author Equipo Sportify
 */
public interface UsuarioRolRepository extends JpaRepository<UsuarioRol, UsuarioRolId> {

    /**
     * Cuenta los responsables que conservan acceso al panel.
     * @return cantidad de administradores de plataforma activos
     */
    @org.springframework.data.jpa.repository.Query("select count(ur) from UsuarioRol ur where ur.rol.nombre = 'ADMIN_PLATAFORMA' and ur.usuario.estado = 'ACTIVO'")
    long contarAdministradoresActivos();

    /**
     * Consulta todas las asociaciones pertenecientes a un usuario.
     *
     * @param idUsuario identificador del usuario
     * @return asociaciones del usuario; lista vacía si no existen
     * @throws org.springframework.dao.DataAccessException si falla el acceso a persistencia
     */
    List<UsuarioRol> findByIdUsuario(Long idUsuario);
    /**
     * Resuelve una asignación mediante ambos componentes de su clave.
     *
     * @param idUsuario identificador del usuario
     * @param idRol identificador del rol
     * @return asignación encontrada o Optional vacío
     * @throws org.springframework.dao.DataAccessException si falla el acceso a persistencia
     */
    Optional<UsuarioRol> findByIdUsuarioAndIdRol(Long idUsuario,Long idRol);
    /**
     * Consulta las asignaciones del rol indicado.
     *
     * @param idRol identificador del rol
     * @return asignaciones del rol; lista vacía si no existen
     * @throws org.springframework.dao.DataAccessException si falla el acceso a persistencia
     */
    List<UsuarioRol> findByIdRol(Long idRol);
}
