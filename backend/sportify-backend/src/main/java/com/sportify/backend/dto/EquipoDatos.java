package com.sportify.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Contratos de entrada para las operaciones sobre equipos y su plantel.
 * Evita que una solicitud modifique IDs, capitanía o estado no autorizado.
 *
 * @author Equipo Sportify
 */
public class EquipoDatos {
    private EquipoDatos() { }

    /** Datos validados para crear un equipo. */
    public record Creacion(
            @NotBlank @Size(max = 100) String nombre,
            @NotBlank @Pattern(regexp = "PRINCIPIANTE|INTERMEDIO|AVANZADO") String nivel) { }

    /** Nuevo nombre validado para un equipo. */
    public record Edicion(
            @NotBlank @Size(max = 100) String nombre) { }

    /** Nivel competitivo admitido para un equipo. */
    public record Nivel(
            @NotBlank @Pattern(regexp = "PRINCIPIANTE|INTERMEDIO|AVANZADO") String nivel) { }

    /** Estado activo o inactivo del equipo. */
    public record Estado(
            @NotNull @Pattern(regexp = "ACTIVO|INACTIVO") String estado) { }

    /** Identidad del usuario que se solicita agregar al plantel. */
    public record AgregarJugador(
            @NotNull Long idUsuario) { }

    /** Identidad del miembro que asumirá la capitanía. */
    public record TransferirCapitan(
            @NotNull Long idUsuario) { }
}
