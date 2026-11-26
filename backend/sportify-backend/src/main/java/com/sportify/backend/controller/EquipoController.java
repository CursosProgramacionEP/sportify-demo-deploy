package com.sportify.backend.controller;

import java.util.List;
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
import com.sportify.backend.dto.EquipoDatos;
import com.sportify.backend.dto.EquipoResumen;
import com.sportify.backend.dto.UsuarioBuscadoResumen;                 
import com.sportify.backend.service.EquipoJugadorService;  
import com.sportify.backend.service.EquipoService;
import jakarta.validation.Valid;

/**
 * Expone creación, consulta, edición, nivel, estado y transferencia de capitanía
 * de equipos. El identificador del solicitante sale siempre de Authentication.
 *
 * @author Equipo Sportify
 */
@RestController
@RequestMapping("/api/equipos")
public class EquipoController {
    private final EquipoService equipos;
    private final EquipoJugadorService jugadores;

    public EquipoController(EquipoService equipos, EquipoJugadorService jugadores) {
        this.equipos = equipos;
        this.jugadores = jugadores;
    }

    /**
     * Crea un equipo para el usuario autenticado.
     *
     * @param datos nombre y nivel validados
     * @param authentication identidad del solicitante
     * @return equipo creado
     */
    @PostMapping
    public EquipoResumen crear(@Valid @RequestBody EquipoDatos.Creacion datos, Authentication authentication) {
        return equipos.crear((Long) authentication.getPrincipal(), datos);
    }

    /**
     * Lista los equipos donde el usuario autenticado es miembro.
     *
     * @param authentication identidad del solicitante
     * @return equipos del usuario
     */
    @GetMapping("/mios")
    public List<EquipoResumen> listarMios(Authentication authentication) {
        return equipos.listarMios((Long) authentication.getPrincipal());
    }

    /**
     * Consulta un equipo si el solicitante es miembro.
     *
     * @param id identificador del equipo
     * @param authentication identidad del solicitante
     * @return equipo con su total de jugadores
     */
    @GetMapping("/{id}")
    public EquipoResumen obtener(@PathVariable Long id, Authentication authentication) {
        return equipos.obtener(id, (Long) authentication.getPrincipal());
    }

    /**
     * Actualiza el nombre del equipo. Solo el capitán.
     *
     * @param id identificador del equipo
     * @param datos nuevo nombre validado
     * @param authentication identidad del solicitante
     * @return equipo actualizado
     */
    @PutMapping("/{id}")
    public EquipoResumen editar(@PathVariable Long id, @Valid @RequestBody EquipoDatos.Edicion datos,
            Authentication authentication) {
        return equipos.editar(id, (Long) authentication.getPrincipal(), datos);
    }

    /**
     * Cambia el nivel del equipo. Solo el capitán.
     *
     * @param id identificador del equipo
     * @param datos nuevo nivel validado
     * @param authentication identidad del solicitante
     * @return equipo actualizado
     */
    @PatchMapping("/{id}/nivel")
    public EquipoResumen cambiarNivel(@PathVariable Long id, @Valid @RequestBody EquipoDatos.Nivel datos,
            Authentication authentication) {
        return equipos.cambiarNivel(id, (Long) authentication.getPrincipal(), datos.nivel());
    }

    /**
     * Activa o desactiva el equipo. Solo el capitán.
     *
     * @param id identificador del equipo
     * @param datos estado solicitado
     * @param authentication identidad del solicitante
     * @return equipo actualizado
     */
    @PatchMapping("/{id}/estado")
    public EquipoResumen cambiarEstado(@PathVariable Long id, @Valid @RequestBody EquipoDatos.Estado datos,
            Authentication authentication) {
        return equipos.cambiarEstado(id, (Long) authentication.getPrincipal(), datos.estado());
    }

    /**
     * Transfiere la capitanía a otro miembro. Solo el capitán actual.
     *
     * @param id identificador del equipo
     * @param datos nuevo capitán solicitado
     * @param authentication identidad del solicitante
     * @return equipo actualizado
     */
    @PatchMapping("/{id}/capitan")
    public EquipoResumen transferirCapitan(@PathVariable Long id,
            @Valid @RequestBody EquipoDatos.TransferirCapitan datos,
            Authentication authentication) {
        return equipos.transferirCapitan(id, (Long) authentication.getPrincipal(), datos.idUsuario());
    }

    /**
     * Busca un usuario por correo exacto para agregarlo al plantel. Solo capitanes.
     *
     * @param correo correo exacto del usuario buscado
     * @param authentication identidad del solicitante
     * @return datos mínimos del usuario encontrado
     */
    @GetMapping("/buscar-jugador")
    public UsuarioBuscadoResumen buscarJugador(@RequestParam String correo, Authentication authentication) {
        return jugadores.buscarJugador((Long) authentication.getPrincipal(), correo);
    }
}
