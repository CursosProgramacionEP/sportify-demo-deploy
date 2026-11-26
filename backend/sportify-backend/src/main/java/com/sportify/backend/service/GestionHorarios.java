package com.sportify.backend.service;

import com.sportify.backend.dto.HorarioDTO;

import java.util.List;

/**
 * Contrato de escritura de horarios. Solo lo necesita quien configura el complejo.
 *
 * @author Equipo Sportify
 */
public interface GestionHorarios {

    /** Reemplaza el horario semanal del complejo y devuelve lo que quedó guardado. */
    List<HorarioDTO> guardarHorarios(Long idComplejo, List<HorarioDTO> horarios);
}
