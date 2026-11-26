package com.sportify.backend.service;

import java.time.LocalDate;
import java.util.List;

import com.sportify.backend.dto.BloqueHorarioDTO;

/**
 * Contrato de solo lectura sobre la ocupación de canchas.
 * Lo usa quien únicamente necesita saber qué horas están tomadas (por ejemplo, la
 * disponibilidad), sin acceso a crear, confirmar ni cancelar reservas.
 *
 * @author Equipo Sportify
 */
public interface ConsultaReservas {

    /**
     * Devuelve los bloques ocupados por reservas pendientes o confirmadas.
     *
     * @param idCancha cancha consultada
     * @param fecha día consultado
     * @return bloques ocupados; lista vacía si no hay reservas
     */
    List<BloqueHorarioDTO> bloquesOcupados(Long idCancha, LocalDate fecha);
}