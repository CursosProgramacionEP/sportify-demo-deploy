package com.sportify.backend.controller;

import com.sportify.backend.dto.CanchaCatalogoDTO;
import com.sportify.backend.dto.SlotDisponibilidadDTO;
import com.sportify.backend.model.Cancha;
import com.sportify.backend.service.CanchaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Expone los endpoints para la gestión de canchas.
 * 
 * @author Equipo Sportify
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class CanchaController {

    private final CanchaService canchaService;

    /**
     * Crea el controlador de canchas.
     * @param canchaService servicio de consulta, gestión y disponibilidad
     */
    public CanchaController(CanchaService canchaService) {
        this.canchaService = canchaService;
    }

    /**
     * Lista las canchas asociadas al complejo indicado.
     * @param idComplejo complejo consultado
     * @return canchas asociadas
     */
    @GetMapping("/complejos/{idComplejo}/canchas")
    public ResponseEntity<List<Cancha>> listar(@PathVariable Long idComplejo) {
        return ResponseEntity.ok(canchaService.listarPorComplejo(idComplejo));
    }

    /**
     * Registra una cancha en el complejo indicado.
     * @param idComplejo complejo propietario
     * @param cancha datos validados
     * @return cancha persistida
     * @throws org.springframework.web.server.ResponseStatusException si el complejo no existe o el nombre ya está registrado allí
     */
    @PostMapping("/complejos/{idComplejo}/canchas")
    public ResponseEntity<Cancha> registrar(@PathVariable Long idComplejo, @Valid @RequestBody Cancha cancha) {
        return ResponseEntity.ok(canchaService.registrar(idComplejo, cancha));
    }

    /**
     * Sustituye los datos editables de una cancha existente.
     * @param id cancha modificada
     * @param datos campos validados
     * @return cancha guardada
     * @throws org.springframework.web.server.ResponseStatusException si la cancha no existe
     */
    @PutMapping("/canchas/{id}")
    public ResponseEntity<Cancha> modificar(@PathVariable Long id, @Valid @RequestBody Cancha datos) {
        return ResponseEntity.ok(canchaService.modificar(id, datos));
    }

    /**
     * Persiste el estado recibido para la cancha.
     * @param id cancha modificada
     * @param estado nuevo estado; el servicio no valida un catálogo de valores
     * @return cancha guardada
     * @throws org.springframework.web.server.ResponseStatusException si la cancha no existe
     */
    @PatchMapping("/canchas/{id}/estado")
    public ResponseEntity<Cancha> cambiarEstado(@PathVariable Long id, @RequestParam String estado) {
        return ResponseEntity.ok(canchaService.cambiarEstado(id, estado));
    }

    /** @return catálogo con las canchas cuyo estado es {@code ACTIVA} */
    @GetMapping("/canchas")
    public ResponseEntity<List<CanchaCatalogoDTO>> listarCatalogo() {
        return ResponseEntity.ok(canchaService.listarCatalogo());
    }

    /**
     * Calcula bloques de una hora desde el horario del complejo y marca como no
     * disponibles los ya reservados o pasados.
     * 
     * @param id    identificador de la cancha
     * @param fecha fecha en formato ISO {@code YYYY-MM-DD}
     * @return bloques del día con su disponibilidad real
     * @throws org.springframework.web.server.ResponseStatusException si la cancha no existe o la fecha no puede analizarse
     */
    @GetMapping("/canchas/{id}/disponibilidad")
    public ResponseEntity<List<SlotDisponibilidadDTO>> disponibilidad(
            @PathVariable Long id, @RequestParam String fecha) {
        return ResponseEntity.ok(canchaService.obtenerDisponibilidad(id, fecha));
    }
}
