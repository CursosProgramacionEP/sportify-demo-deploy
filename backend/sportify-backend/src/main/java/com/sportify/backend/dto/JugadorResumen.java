package com.sportify.backend.dto;

import java.time.LocalDate;

/**
 * Datos de un miembro de equipo expuestos al plantel.
 * @param idUsuario identificador de cuenta
 * @param nombres nombres del miembro
 * @param apellidos apellidos del miembro
 * @param correo correo de la cuenta
 * @param rolEquipo rol del miembro dentro del equipo
 * @param fechaIngreso fecha local en que se agregó al plantel
 */
public record JugadorResumen(
        Long idUsuario, String nombres, String apellidos, String correo, String rolEquipo,
        LocalDate fechaIngreso) { }
