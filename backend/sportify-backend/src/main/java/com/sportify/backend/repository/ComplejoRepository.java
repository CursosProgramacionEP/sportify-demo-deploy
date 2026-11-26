package com.sportify.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sportify.backend.model.Complejo;

/**
 * Accede a complejos deportivos por identificador o nombre exacto.
 *
 * @author Equipo Sportify
 */
public interface ComplejoRepository extends JpaRepository<Complejo, Long>{

    long countByEstado(String estado);
    /**
     * Consulta por la clave primaria del complejo.
     *
     * @param id identificador del complejo
     * @return entidad encontrada o Optional vacío
     * @throws org.springframework.dao.DataAccessException si falla el acceso a persistencia
     */
    Optional<Complejo> findById(Long id);

    /**
     * Consulta por coincidencia exacta del nombre persistido.
     *
     * @param nombre nombre exacto que se consulta
     * @return entidad encontrada o Optional vacío
     * @throws org.springframework.dao.DataAccessException si falla el acceso a persistencia
     */
    Optional<Complejo> findByNombre(String nombre);
}
