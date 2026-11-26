package com.sportify.backend.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sportify.backend.dto.ReservaDatos;
import com.sportify.backend.dto.ReservaResumen;
import com.sportify.backend.service.ReservaService;

import jakarta.validation.Valid;

/**
 * Endpoints de reservas: el cliente reserva y gestiona las suyas; el administrador
 * del complejo las consulta, confirma y cancela.
 *
 * @author Equipo Sportify
 */
@RestController
@RequestMapping("/api")
public class ReservaController {

    private final ReservaService reservaService;

    /**
     * Crea el controlador de reservas.
     *
     * @param reservaService lógica de reservas
     */
    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    /**
     * Crea una reserva PENDIENTE para el usuario autenticado.
     *
     * @param datos cancha, fecha y franja validadas
     * @param auth identidad del solicitante
     * @return 201 con la reserva creada
     * @throws org.springframework.web.server.ResponseStatusException si la franja es inválida u ocupada
     */
    @PostMapping("/reservas")
    public ResponseEntity<ReservaResumen> crear(@Valid @RequestBody ReservaDatos.Creacion datos,
            Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reservaService.crear(idUsuario(auth), datos));
    }

    /**
     * Lista las reservas del usuario autenticado.
     *
     * @param auth identidad del solicitante
     * @return sus reservas, la más reciente primero
     */
    @GetMapping("/reservas/mias")
    public List<ReservaResumen> mias(Authentication auth) {
        return reservaService.listarMias(idUsuario(auth));
    }

    /**
     * Consulta una reserva (su dueño o el administrador del complejo).
     *
     * @param id identificador de la reserva
     * @param auth identidad del solicitante
     * @return la reserva
     * @throws org.springframework.web.server.ResponseStatusException si no existe o no tiene acceso
     */
    @GetMapping("/reservas/{id}")
    public ReservaResumen obtener(@PathVariable Long id, Authentication auth) {
        return reservaService.obtener(id, idUsuario(auth), esAdminPlataforma(auth));
    }

    /**
     * Cambia la fecha u hora de una reserva. Solo su dueño.
     *
     * @param id identificador de la reserva
     * @param datos nueva fecha y franja validadas
     * @param auth identidad del solicitante
     * @return la reserva actualizada
     * @throws org.springframework.web.server.ResponseStatusException si no es del solicitante o la franja no es válida
     */
    @PutMapping("/reservas/{id}")
    public ReservaResumen modificar(@PathVariable Long id,
            @Valid @RequestBody ReservaDatos.Modificacion datos, Authentication auth) {
        return reservaService.modificar(id, idUsuario(auth), datos);
    }

    /**
     * Confirma una reserva pendiente. Solo quien administra el complejo.
     *
     * @param id identificador de la reserva
     * @param auth identidad del solicitante
     * @return la reserva confirmada
     * @throws org.springframework.web.server.ResponseStatusException si no tiene permiso o no está pendiente
     */
    @PatchMapping("/reservas/{id}/confirmar")
    public ReservaResumen confirmar(@PathVariable Long id, Authentication auth) {
        return reservaService.confirmar(id, idUsuario(auth), esAdminPlataforma(auth));
    }

    /**
     * Cancela una reserva. Su dueño o el administrador del complejo.
     *
     * @param id identificador de la reserva
     * @param auth identidad del solicitante
     * @return la reserva cancelada
     * @throws org.springframework.web.server.ResponseStatusException si no tiene permiso o ya no se puede cancelar
     */
    @PatchMapping("/reservas/{id}/cancelar")
    public ReservaResumen cancelar(@PathVariable Long id, Authentication auth) {
        return reservaService.cancelar(id, idUsuario(auth), esAdminPlataforma(auth));
    }

    /**
     * Lista las reservas de un complejo, opcionalmente de un solo día.
     *
     * @param idComplejo complejo consultado
     * @param fecha día en formato {@code YYYY-MM-DD}; si se omite, todas
     * @param auth identidad del solicitante
     * @return reservas del complejo
     * @throws org.springframework.web.server.ResponseStatusException si el solicitante no administra el complejo
     */
    @GetMapping("/complejos/{idComplejo}/reservas")
    public List<ReservaResumen> porComplejo(@PathVariable Long idComplejo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            Authentication auth) {
        return reservaService.listarPorComplejo(idComplejo, fecha, idUsuario(auth), esAdminPlataforma(auth));
    }

    private static Long idUsuario(Authentication auth) {
        return (Long) auth.getPrincipal();
    }

    private static boolean esAdminPlataforma(Authentication auth) {
        return auth.getAuthorities().stream()
                .anyMatch(rol -> "ROLE_ADMIN_PLATAFORMA".equals(rol.getAuthority()));
    }
}
