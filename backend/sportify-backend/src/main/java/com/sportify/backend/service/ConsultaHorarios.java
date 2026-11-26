package com.sportify.backend.service;

import com.sportify.backend.dto.HorarioDTO;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

/**
 * Contrato de solo lectura sobre los horarios de un complejo.
 * Lo usan quienes únicamente necesitan consultar (por ejemplo, la disponibilidad de una cancha).
 *
 * @author Equipo Sportify
 */
public interface ConsultaHorarios {

    /** Devuelve los días en que el complejo abre, de lunes a domingo. */
    List<HorarioDTO> listarHorarios(Long idComplejo);

    /** Devuelve el horario de un día, o vacío si el complejo no abre ese día. */
    Optional<HorarioDTO> obtenerHorarioDia(Long idComplejo, DayOfWeek dia);
}
