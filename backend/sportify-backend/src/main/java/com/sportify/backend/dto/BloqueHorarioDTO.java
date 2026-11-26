package com.sportify.backend.dto;

import java.time.LocalTime;

/**
 * Intervalo de una hora propuesto dentro del horario de atención.
 * @param horaInicio hora local en que comienza el bloque
 * @param horaFin hora local en que termina el bloque
 */
public record BloqueHorarioDTO(
        LocalTime horaInicio,
        LocalTime horaFin) {}
