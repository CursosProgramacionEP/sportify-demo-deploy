package com.sportify.backend.controller;

import com.sportify.backend.dto.*;
import com.sportify.backend.service.UsuarioService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/** Gestión de cuentas reservada por SecurityConfig a ADMIN_PLATAFORMA.
 * @author Equipo Sportify
 */
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
    private final UsuarioService usuarios;

    /**
     * Delega las restricciones de acceso y edición a la capa de negocio.
     * @param usuarios servicio de cuentas y roles
     */
    public UsuarioController(UsuarioService usuarios) { this.usuarios = usuarios; }

    /**
     * Proporciona el catálogo de cuentas al panel administrativo.
     * @return cuentas sin contraseñas, con estado y roles
     */
    @GetMapping
    public List<UsuarioResumen> listarUsuarios() { return usuarios.listar(); }

    /**
     * Actualiza únicamente los campos personales admitidos por el DTO.
     * @param id cuenta afectada
     * @param datos campos personales validados
     * @return cuenta actualizada
     * @throws org.springframework.web.server.ResponseStatusException si no existe o el correo está ocupado
     */
    @PutMapping("/{id}")
    public UsuarioResumen editar(@PathVariable Long id, @Valid @RequestBody UsuarioDatos.Edicion datos) {
        return usuarios.editar(id, datos);
    }

    /**
     * Cambia el estado de acceso respetando las restricciones de administración.
     * @param id cuenta afectada
     * @param datos estado solicitado
     * @param authentication identidad del administrador solicitante
     * @return cuenta actualizada
     * @throws org.springframework.web.server.ResponseStatusException si el cambio es rechazado
     */
    @PatchMapping("/{id}/estado")
    public UsuarioResumen estado(@PathVariable Long id, @Valid @RequestBody UsuarioDatos.Estado datos,
            Authentication authentication) {
        return usuarios.cambiarEstado(id, datos.estado(), (Long) authentication.getPrincipal());
    }

    /**
     * Concede o retira el rol del sistema, conservando los roles de cliente y complejo.
     * @param id cuenta afectada
     * @param datos concesión o retirada solicitada
     * @param authentication identidad del administrador solicitante
     * @return cuenta con sus permisos actualizados
     * @throws org.springframework.web.server.ResponseStatusException si el cambio es rechazado
     */
    @PutMapping("/{id}/rol-plataforma")
    public UsuarioResumen rol(@PathVariable Long id, @Valid @RequestBody UsuarioDatos.RolPlataforma datos,
            Authentication authentication) {
        return usuarios.cambiarRolPlataforma(id, datos.administrador(), (Long) authentication.getPrincipal());
    }
}
