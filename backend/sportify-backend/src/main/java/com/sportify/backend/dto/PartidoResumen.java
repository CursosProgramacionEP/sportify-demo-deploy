package com.sportify.backend.dto;

import java.time.LocalDate;

/**
 * Vista pública de un partido. El resultado se calcula al proyectar:
 * VICTORIA, EMPATE o DERROTA.
 *
 * @author Equipo Sportify
 */
public record PartidoResumen(
    Long idPartido, Long idEquipo, LocalDate fecha, String rival, Integer golesFavor, Integer golesContra,
        String observaciones, String resultado) { }

