package com.sportify.backend.dto;

import java.time.LocalDate;

/**
 * Vista pública de un equipo. No expone relaciones lazy ni datos internos.
 *
 * @author Equipo Sportify
 */
public record EquipoResumen(
        Long idEquipo, Long idUsuarioResponsable, String nombre, String nivel, String estado,
        LocalDate fechaCreacion, long totalJugadores) { }