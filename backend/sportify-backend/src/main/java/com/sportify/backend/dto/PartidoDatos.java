package com.sportify.backend.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

/**
 * Contratos de entrada para registrar y editar partidos del historial.
 *
 * @author Equipo Sportify
 */
public class PartidoDatos {
    private PartidoDatos() { }

    /** Datos validados para registrar un partido pasado o del día actual. */
    public record Registro(
            @NotNull @PastOrPresent LocalDate fecha,
            @NotBlank @Size(max = 100) String rival,
            @NotNull @Min(0) Integer golesFavor,
            @NotNull @Min(0) Integer golesContra,
            @Size(max = 255) String observaciones) { }

    /** Datos validados que sustituyen los campos editables de un partido. */
    public record Edicion(
            @NotNull @PastOrPresent LocalDate fecha,
            @NotBlank @Size(max = 100) String rival,
            @NotNull @Min(0) Integer golesFavor,
            @NotNull @Min(0) Integer golesContra,
            @Size(max = 255) String observaciones) { }
}
