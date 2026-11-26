package com.sportify.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.sportify.backend.model.Partido;
/**
 * Accede al historial de partidos por equipo, ordenado del más reciente
 * al más antiguo.
 *
 * @author Equipo Sportify
 */

public interface PartidoRepository extends JpaRepository<Partido, Long> {
    /**
     * Lista los partidos del equipo ordenados por fecha descendente.
     *
     * @param idEquipo identificador del equipo
     * @return partidos del equipo; lista vacía si no tiene
     */
    List<Partido> findByIdEquipoOrderByFechaDesc(Long idEquipo);
}
