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
import com.sportify.backend.dto.EquipoDatos;
import com.sportify.backend.dto.JugadorResumen;
import com.sportify.backend.service.EquipoJugadorService;
import jakarta.validation.Valid;

/**
 * Expone el plantel del equipo: consulta para miembros y modificación para el capitán.
 *
 * @author Equipo Sportify
 */
@RestController
@RequestMapping("/api/equipos/{idEquipo}/jugadores")
public class EquipoJugadorController {
    private final EquipoJugadorService jugadores;

    public EquipoJugadorController(EquipoJugadorService jugadores) {
        this.jugadores = jugadores;
    }

    /**
     * Lista el plantel. Cualquier miembro puede consultarlo.
     *
     * @param idEquipo identificador del equipo
     * @param authentication identidad del solicitante
     * @return miembros del equipo
     */
    @GetMapping
    public List<JugadorResumen> listar(@PathVariable Long idEquipo, Authentication authentication) {
        return jugadores.listar(idEquipo, (Long) authentication.getPrincipal());
    }

    /**
     * Agrega un jugador al equipo. Solo el capitán.
     *
     * @param idEquipo identificador del equipo
     * @param datos usuario a agregar
     * @param authentication identidad del solicitante
     * @return miembro agregado
     */
    @PostMapping
    public JugadorResumen agregar(@PathVariable Long idEquipo,
            @Valid @RequestBody EquipoDatos.AgregarJugador datos,
            Authentication authentication) {
        return jugadores.agregar(idEquipo, (Long) authentication.getPrincipal(), datos.idUsuario());
    }

    /**
     * Retira un jugador del equipo. Solo el capitán.
     *
     * @param idEquipo identificador del equipo
     * @param idUsuario identificador del jugador a retirar
     * @param authentication identidad del solicitante
     * @return 204 sin cuerpo
     */
    @DeleteMapping("/{idUsuario}")
    public ResponseEntity<Void> retirar(@PathVariable Long idEquipo, @PathVariable Long idUsuario,
            Authentication authentication) {
        jugadores.retirar(idEquipo, (Long) authentication.getPrincipal(), idUsuario);
        return ResponseEntity.noContent().build();
    }
}
