package com.sportify.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sportify.backend.model.AdministradorComplejo;
import com.sportify.backend.model.AdministradorComplejoId;

/**
 * Consulta asociaciones de administración mediante la clave compuesta usuario-complejo.
 *
 * @author Equipo Sportify
 */
public interface AdministradorComplejoRepository extends JpaRepository<AdministradorComplejo, AdministradorComplejoId>{

    /**
     * Consulta las asociaciones cuyo identificador de complejo coincide.
     *
     * @param idComplejo identificador del complejo consultado
     * @return asociaciones coincidentes o lista vacía
     * @throws org.springframework.dao.DataAccessException si falla el acceso a persistencia
     */
    List <AdministradorComplejo> findByIdComplejo(Long idComplejo);
    /**
     * Consulta los complejos administrados por un usuario mediante sus asociaciones.
     *
     * @param idUsuario identificador del usuario consultado
     * @return asociaciones coincidentes o lista vacía
     * @throws org.springframework.dao.DataAccessException si falla el acceso a persistencia
     */
    List <AdministradorComplejo> findByIdUsuario(Long idUsuario);
    /**
     * Resuelve una asociación mediante usuario y complejo.
     *
     * @param idUsuario identificador del usuario
     * @param idComplejo identificador del complejo
     * @return asociación encontrada o Optional vacío
     * @throws org.springframework.dao.DataAccessException si falla el acceso a persistencia
     */
    Optional<AdministradorComplejo> findByIdUsuarioAndIdComplejo(Long idUsuario,Long idComplejo);
    /**
     * Comprueba si un usuario ya administra un complejo concreto.
     *
     * @param idUsuario identificador del usuario
     * @param idComplejo identificador del complejo
     * @return true cuando la asociación existe
     * @throws org.springframework.dao.DataAccessException si falla el acceso a persistencia
     */
    boolean existsByIdUsuarioAndIdComplejo(Long idUsuario,Long idComplejo);
}
