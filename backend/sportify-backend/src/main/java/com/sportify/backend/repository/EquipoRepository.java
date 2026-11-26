package com.sportify.backend.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.sportify.backend.model.Equipo;

/**
 * Accede a equipos por identificador, responsable y nombre único por capitán.
 *
 * @author Equipo Sportify
 */

public interface EquipoRepository extends JpaRepository<Equipo, Long> {

    /**
     * Lista los equipos donde el usuario es responsable.
     *
     * @param idUsuarioResponsable identificador del capitán
     * @return equipos del capitán; lista vacía si no tiene
     */
    List<Equipo> findByIdUsuarioResponsable(Long idUsuarioResponsable);


    /**
     * Comprueba si el capitán ya tiene un equipo con ese nombre.
     *
     * @param nombre nombre propuesto
     * @param idUsuarioResponsable identificador del capitán
     * @return true si ya existe
     */
    boolean existsByNombreIgnoreCaseAndIdUsuarioResponsable(String nombre, Long idUsuarioResponsable);

    /**
     * Comprueba duplicado de nombre excluyendo el equipo que se está editando.
     *
     * @param nombre nombre propuesto
     * @param idUsuarioResponsable identificador del capitán
     * @param idEquipo equipo excluido de la comprobación
     * @return true si otro equipo del mismo capitán usa el nombre
     */
    boolean existsByNombreIgnoreCaseAndIdUsuarioResponsableAndIdEquipoNot(
            String nombre, Long idUsuarioResponsable, Long idEquipo);

    /**
     * Cuenta cuántos equipos ha creado el usuario, activos o inactivos.
     *
     * @param idUsuarioResponsable identificador del capitán
     * @return total de equipos creados por el capitán
     */
    long countByIdUsuarioResponsable(Long idUsuarioResponsable);

    /**
     * Comprueba si el usuario es responsable de al menos un equipo. Se usa para
     * restringir la búsqueda de jugadores a capitanes.
     *
     * @param idUsuarioResponsable identificador del usuario
     * @return true si es capitán de al menos un equipo
     */
    boolean existsByIdUsuarioResponsable(Long idUsuarioResponsable);
}
