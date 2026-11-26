package com.sportify.backend.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sportify.backend.dto.DisponibilidadDTO;
import com.sportify.backend.dto.HorarioDTO;
import com.sportify.backend.service.HorarioService;

/** Endpoints de consulta y edición de horarios de atención de complejos. */
@RestController
@RequestMapping("/api/complejos/{idComplejo}")
public class HorarioController {

    private final HorarioService horarioService;

    /**
     * Crea el controlador de horarios.
     * @param horarioService consulta y persistencia de horarios
     */
    public HorarioController(HorarioService horarioService) {
        this.horarioService = horarioService;
    }

    /**
     * Lista los días configurados en el horario del complejo.
     * @param idComplejo complejo consultado
     * @return días con horario configurado
     * @throws org.springframework.web.server.ResponseStatusException si el complejo no existe
     */
    @GetMapping("/horarios")
    public ResponseEntity<List<HorarioDTO>> listarHorarios(@PathVariable Long idComplejo) {
        return ResponseEntity.ok(horarioService.listarHorarios(idComplejo));
    }

    /**
     * Reemplaza los horarios semanales del complejo por la lista recibida.
     * @param idComplejo identificador del complejo
     * @param horarios lista de horarios sin días repetidos y con horas válidas
     * @return horarios guardados
     * @throws org.springframework.web.server.ResponseStatusException si el complejo no existe o la lista es inválida
     */
    @PutMapping("/horarios")
    public ResponseEntity<List<HorarioDTO>> guardarHorarios(@PathVariable Long idComplejo,
                                                            @RequestBody List<HorarioDTO> horarios) {
        return ResponseEntity.ok(horarioService.guardarHorarios(idComplejo, horarios));
    }

    /**
     * Calcula los bloques de la cancha según el horario semanal; no descuenta reservas.
     * @param idComplejo identificador del complejo
     * @param idCancha identificador de la cancha
     * @param fecha fecha local consultada
     * @return horario y bloques generados para la fecha
     * @throws org.springframework.web.server.ResponseStatusException si el complejo o la cancha no existe
     */
    @GetMapping("/canchas/{idCancha}/disponibilidad")
    public ResponseEntity<DisponibilidadDTO> disponibilidad(
            @PathVariable Long idComplejo,
            @PathVariable Long idCancha,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(horarioService.calcularDisponibilidad(idComplejo, idCancha, fecha));
    }
}
