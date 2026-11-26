package com.sportify.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.NotNull;

/**
 * Contratos de entrada para crear y modificar reservas.
 *
 * @author Equipo Sportify
 */
public class ReservaDatos {
    private ReservaDatos() { }

    /**
     * Datos para crear una reserva.
     *
     * @param idCancha cancha que se desea reservar
     * @param fecha día de la reserva
     * @param horaInicio hora en que empieza la franja
     * @param horaFin hora en que termina la franja
     */
    public record Creacion(
            @NotNull Long idCancha,
            @NotNull LocalDate fecha,
            @NotNull LocalTime horaInicio,
            @NotNull LocalTime horaFin) { }

    /**
     * Datos que reemplazan la franja de una reserva existente.
     *
     * @param fecha nuevo día de la reserva
     * @param horaInicio nueva hora de inicio
     * @param horaFin nueva hora de fin
     */
    public record Modificacion(
            @NotNull LocalDate fecha,
            @NotNull LocalTime horaInicio,
            @NotNull LocalTime horaFin) { }
}