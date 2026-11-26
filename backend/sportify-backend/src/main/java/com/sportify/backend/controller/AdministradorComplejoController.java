package com.sportify.backend.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sportify.backend.model.AdministradorComplejo;
import com.sportify.backend.service.AdministradorComplejoService;

/**
 * Expone la consulta, asignación y retirada de administradores de un complejo.
 *
 * @author Equipo Sportify
 */
@RestController
@RequestMapping("/api/complejos")
public class AdministradorComplejoController {
    private final AdministradorComplejoService administradorComplejoService;

    /**
     * Recibe el servicio que coordina asociaciones de administración y roles.
     *
     * @param administradorComplejoService servicio que sincroniza asociaciones y roles
     */
    public AdministradorComplejoController(AdministradorComplejoService administradorComplejoService) {
        this.administradorComplejoService = administradorComplejoService;
    }


    /**
     * Devuelve asociaciones por complejo; una lista vacía no confirma que el complejo exista.
     *
     * @param id identificador del complejo consultado
     * @return 200 con asociaciones que contienen los identificadores de usuario y complejo
     */
    @GetMapping("/{id}/administradores")
        public ResponseEntity <List<AdministradorComplejo>> listarAdministradores(@PathVariable Long id){
            List<AdministradorComplejo> administradores = administradorComplejoService.listarAdministradores(id);
            return ResponseEntity.ok(administradores);

    }

    @GetMapping("/administradores")
    public ResponseEntity<List<AdministradorComplejo>> listarTodos() {
        return ResponseEntity.ok(administradorComplejoService.listarTodos());
    }

    /**
     * Obtiene los complejos que administra el usuario actualmente logueado.
     * Utilizado por el frontend para que el Administrador de Complejo sepa qué sede gestionar.
     *
     * @param authentication contexto de seguridad inyectado por Spring con los datos de la sesión
     * @return 200 con la lista de complejos asignados al usuario, o lista vacía si no tiene ninguno
     */
    @GetMapping("/mio")
    public ResponseEntity<List<AdministradorComplejo>> listarMisComplejos(Authentication authentication) {
        // Extraemos el ID del usuario desde el contexto de seguridad (el token de sesión)
        Long idUsuario = (Long) authentication.getPrincipal();
        
        // Buscamos todas las relaciones de este usuario
        List<AdministradorComplejo> misComplejos = administradorComplejoService.listarPorUsuario(idUsuario);
        
        return ResponseEntity.ok(misComplejos);
    }

    /**
     * Asocia el usuario del cuerpo JSON al complejo de la ruta y le asigna el rol necesario.
     *
     * @param id identificador del complejo
     * @param datos datos recibidos para la operación
     * @return 200 con la asociación creada
     * @throws RuntimeException si falta el usuario, el complejo o el rol ADMIN_COMPLEJO, o la asociación ya existe
     */
    @PostMapping("/{id}/administradores")
    public ResponseEntity<AdministradorComplejo> asociarAdministrador(@PathVariable Long id, @RequestBody AdministradorComplejo datos){
        AdministradorComplejo administradorComplejo = administradorComplejoService.asociarAdministrador(id, datos.getIdUsuario());
        return  ResponseEntity.ok(administradorComplejo);
    }

    /**
     * Retira la asociación solicitada; el servicio retira el rol si era el último complejo administrado.
     *
     * @param id identificador del complejo
     * @param idUsuario identificador del usuario
     * @return 204 sin cuerpo si se eliminó o 404 si no existía
     * @throws RuntimeException si se necesita retirar el rol y ADMIN_COMPLEJO no existe
     */
    @DeleteMapping ("/{id}/administradores/{idUsuario}")
    public ResponseEntity<Void> eliminarAdministrador(@PathVariable Long id,@PathVariable Long idUsuario) {
        boolean eliminado = administradorComplejoService.eliminarAdministrador(id,idUsuario);
        if (!eliminado) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
