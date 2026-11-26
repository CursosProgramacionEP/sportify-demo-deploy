package com.sportify.backend.dto;
import java.time.LocalDate;
import java.util.List;

/**
 * Horario de atención de una cancha para una fecha determinada.
 * @param idComplejo identificador del complejo consultado
 * @param idCancha identificador de la cancha consultada
 * @param fecha fecha local consultada
 * @param diaSemana día normalizado sin tildes
 * @param abierto indica si el complejo tiene horario para ese día
 * @param bloques bloques horarios generados; no se descuentan reservas existentes
 */
public record DisponibilidadDTO(
        Long idComplejo, Long idCancha, LocalDate fecha, String diaSemana,
        boolean abierto, List<BloqueHorarioDTO> bloques) {}
