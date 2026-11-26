package com.sportify.backend.dto;

import java.math.BigDecimal;

/**
 * Vista pública de una cancha para el catálogo del cliente.
 * Incluye datos del complejo para evitar consultas adicionales en el frontend.
 *
 * @param idCancha identificador de la cancha
 * @param nombre nombre de la cancha
 * @param precioHora precio por hora
 * @param capacidad capacidad declarada para la cancha
 * @param estado estado almacenado de la cancha
 * @param idComplejo identificador del complejo propietario
 * @param nombreComplejo nombre del complejo, o texto sustituto si falta el registro asociado
 * @param direccionComplejo dirección del complejo asociado
 * @author Equipo Sportify
 */
public record CanchaCatalogoDTO(
        Long idCancha,
        String nombre,
        BigDecimal precioHora,
        Integer capacidad,
        String estado,
        Long idComplejo,
        String nombreComplejo,
        String direccionComplejo) { }
