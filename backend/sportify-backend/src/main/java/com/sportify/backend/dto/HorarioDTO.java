package com.sportify.backend.dto;

import java.time.LocalTime;

/**
 * Horario semanal de apertura de un complejo para un solo día.
 * @param diaSemana día normalizado, por ejemplo {@code LUNES}
 * @param horaApertura hora local de apertura
 * @param horaCierre hora local de cierre, posterior a la apertura
 */
public record HorarioDTO(
        String diaSemana, LocalTime horaApertura, LocalTime horaCierre) {}
