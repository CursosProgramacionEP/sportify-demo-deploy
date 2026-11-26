package com.sportify.backend.service;

import com.sportify.backend.dto.UsuarioDatos;
import com.sportify.backend.dto.UsuarioResumen;
import com.sportify.backend.model.*;
import com.sportify.backend.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/** Gestiona cuentas sin borrar usuarios vinculados a reservas, equipos o complejos.
 * @author Equipo Sportify
 */
@Service
@Transactional(readOnly = true)
public class UsuarioService {
    private final UsuarioRepository usuarios;
    private final UsuarioRolRepository asignaciones;
    private final RolRepository roles;
    private final EntityManager entityManager;

    /**
     * Reúne los repositorios y el bloqueo transaccional del rol de plataforma.
     * @param usuarios cuentas persistidas
     * @param asignaciones roles concedidos a cada cuenta
     * @param roles catálogo de permisos
     * @param entityManager gestor del bloqueo compartido entre cambios de acceso
     */
    public UsuarioService(UsuarioRepository usuarios, UsuarioRolRepository asignaciones,
            RolRepository roles, EntityManager entityManager) {
        this.usuarios = usuarios;
        this.asignaciones = asignaciones;
        this.roles = roles;
        this.entityManager = entityManager;
    }

    /**
     * Resuelve una identidad antes de operar sobre la cuenta.
     * @param id identificador persistido
     * @return entidad encontrada
     * @throws ResponseStatusException si no existe la cuenta
     */
    public Usuario buscar(Long id) {
        return usuarios.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "El usuario no existe."));
    }

    /**
     * Consulta los permisos actuales para evitar confiar en roles antiguos de la sesión.
     * @param id identificador del usuario
     * @return nombres de roles ordenados
     */
    public List<String> roles(Long id) {
        return asignaciones.findByIdUsuario(id).stream().map(item -> item.getRol().getNombre()).sorted().toList();
    }

    /**
     * Construye la respuesta pública de una cuenta persistida.
     * @param id identificador del usuario
     * @return datos personales y roles, sin contraseña
     * @throws ResponseStatusException si la cuenta no existe
     */
    public UsuarioResumen resumen(Long id) { return resumen(buscar(id)); }

    /**
     * Proyecta una entidad sin incluir secretos de autenticación.
     * @param usuario entidad persistida
     * @return datos personales y permisos actuales
     */
    public UsuarioResumen resumen(Usuario usuario) {
        return new UsuarioResumen(usuario.getIdUsuario(), usuario.getNombres(), usuario.getApellidos(),
                usuario.getTelefono(), usuario.getCorreo(), usuario.getEstado(), roles(usuario.getIdUsuario()));
    }

    /**
     * Entrega las cuentas al panel y al selector de administradores.
     * @return cuentas ordenadas por identificador, sin contraseñas
     */
    public List<UsuarioResumen> listar() {
        return usuarios.findAll(org.springframework.data.domain.Sort.by("idUsuario")).stream().map(this::resumen).toList();
    }

    /**
     * Actualiza datos personales sin permitir cambios de contraseña o privilegios.
     * @param id cuenta que se modifica
     * @param datos campos previamente validados
     * @return cuenta actualizada
     * @throws ResponseStatusException si no existe la cuenta o el correo está ocupado
     */
    @Transactional
    public UsuarioResumen editar(Long id, UsuarioDatos.Edicion datos) {
        Usuario usuario = buscar(id);
        String correo = datos.correo().trim().toLowerCase(Locale.ROOT);
        if (usuarios.existsByCorreoIgnoreCaseAndIdUsuarioNot(correo, id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El correo ya pertenece a otra cuenta.");
        }
        usuario.setNombres(datos.nombres().trim());
        usuario.setApellidos(datos.apellidos().trim());
        usuario.setCorreo(correo);
        usuario.setTelefono(datos.telefono());
        return resumen(usuarios.save(usuario));
    }

    /**
     * Cambia el acceso sin eliminar asociaciones ni dejar el sistema sin responsable.
     * @param id cuenta afectada
     * @param estado ACTIVO o INACTIVO
     * @param actor administrador autenticado que solicita el cambio
     * @return cuenta actualizada
     * @throws ResponseStatusException si el cambio es inválido o retira un acceso protegido
     */
    @Transactional
    public UsuarioResumen cambiarEstado(Long id, String estado, Long actor) {
        bloquearRolPlataforma();
        Usuario usuario = buscar(id);
        if (!"ACTIVO".equals(estado) && !"INACTIVO".equals(estado)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estado inválido.");
        }
        if ("INACTIVO".equals(estado)) {
            protegerAdministrador(usuario, actor);
        }
        usuario.setEstado(estado);
        return resumen(usuarios.save(usuario));
    }

    /**
     * Concede o retira administración del sistema conservando los otros roles.
     * @param id cuenta afectada
     * @param administrador true para conceder, false para retirar
     * @param actor administrador autenticado que solicita el cambio
     * @return cuenta con los roles actualizados
     * @throws ResponseStatusException si la cuenta no existe o el cambio no está permitido
     */
    @Transactional
    public UsuarioResumen cambiarRolPlataforma(Long id, boolean administrador, Long actor) {
        Rol rol = bloquearRolPlataforma();
        Usuario usuario = buscar(id);
        var asignacion = asignaciones.findByIdUsuarioAndIdRol(id, rol.getIdRol());
        if (administrador && asignacion.isEmpty()) {
            if (!"ACTIVO".equals(usuario.getEstado())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Activa la cuenta antes de conceder permisos.");
            }
            UsuarioRol nueva = new UsuarioRol(id, rol.getIdRol());
            nueva.setRol(rol);
            nueva.setUsuario(usuario);
            asignaciones.save(nueva);
        } else if (!administrador && asignacion.isPresent()) {
            protegerAdministrador(usuario, actor);
            asignaciones.delete(asignacion.get());
            asignaciones.flush();
        }
        return resumen(usuario);
    }

    private Rol bloquearRolPlataforma() {
        Rol rol = roles.findByNombre("ADMIN_PLATAFORMA").orElseThrow(() ->
                new ResponseStatusException(HttpStatus.CONFLICT, "Falta configurar el rol ADMIN_PLATAFORMA."));
        // Serializa los cambios para que dos administradores no retiren simultáneamente el último acceso.
        entityManager.lock(rol, LockModeType.PESSIMISTIC_WRITE);
        return rol;
    }

    private void protegerAdministrador(Usuario usuario, Long actor) {
        if (usuario.getIdUsuario().equals(actor)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No puedes desactivar tu propia cuenta ni retirar tu acceso al panel.");
        }
        if ("ACTIVO".equals(usuario.getEstado()) && roles(usuario.getIdUsuario()).contains("ADMIN_PLATAFORMA")
                && asignaciones.contarAdministradoresActivos() <= 1) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Debe existir al menos un administrador de plataforma activo.");
        }
    }
}
