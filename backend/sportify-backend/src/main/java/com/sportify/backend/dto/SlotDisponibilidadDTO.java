package com.sportify.backend.dto;

/**
 * Bloque horario de una cancha para una fecha.
 *
 * @param horaInicio hora en que empieza el bloque, formato {@code HH:mm}
 * @param horaFin hora en que termina el bloque, formato {@code HH:mm}
 * @param disponible {@code false} si hay una reserva activa que se cruza con el bloque o su hora ya pasó
 *
 * @author Equipo Sportify
 */
public record SlotDisponibilidadDTO(
        String horaInicio,
        String horaFin,
        boolean disponible) { }