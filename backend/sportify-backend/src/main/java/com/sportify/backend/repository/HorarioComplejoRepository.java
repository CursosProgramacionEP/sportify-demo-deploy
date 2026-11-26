package com.sportify.backend.repository;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sportify.backend.model.HorarioComplejo;

/** Consultas de persistencia para horarios semanales de complejos. */
public interface HorarioComplejoRepository extends JpaRepository<HorarioComplejo, Long> {
    /**
     * Consulta los horarios asociados a un complejo.
     * @param idComplejo identificador del complejo
     * @return horarios asociados
     */
    List<HorarioComplejo> findByIdComplejo(Long idComplejo);
    /**
     * Busca el horario de un complejo para un día concreto.
     * @param idComplejo identificador del complejo
     * @param diaSemana día normalizado
     * @return horario encontrado o vacío
     */
    Optional<HorarioComplejo> findByIdComplejoAndDiaSemana(Long idComplejo, String diaSemana);
    /**
     * Elimina todos los horarios de un complejo.
     * @param idComplejo identificador del complejo cuyos horarios se eliminan
     */
    void deleteByIdComplejo(Long idComplejo);
}
