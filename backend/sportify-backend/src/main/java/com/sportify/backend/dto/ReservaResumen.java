package com.sportify.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Vista de una reserva para el frontend, con el nombre de la cancha ya resuelto.
 *
 * @param idReserva identificador de la reserva
 * @param idCancha cancha reservada
 * @param nombreCancha nombre de la cancha
 * @param idComplejo complejo al que pertenece la cancha
 * @param idUsuario usuario que hizo la reserva
 * @param fecha día de la reserva
 * @param horaInicio hora en que empieza la franja
 * @param horaFin hora en que termina la franja
 * @param estado {@code PENDIENTE}, {@code CONFIRMADA} o {@code CANCELADA}
 */
public record ReservaResumen(
        Long idReserva,
        Long idCancha,
        String nombreCancha,
        Long idComplejo,
        Long idUsuario,
        LocalDate fecha,
        LocalTime horaInicio,
        LocalTime horaFin,
        String estado) { }
