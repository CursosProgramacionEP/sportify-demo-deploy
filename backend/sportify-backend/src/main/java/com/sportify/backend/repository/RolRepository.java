package com.sportify.backend.repository;

import com.sportify.backend.model.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/**
 * Resuelve los roles persistidos que necesitan los procesos de registro y administración.
 *
 * @author Equipo Sportify
 */
public interface RolRepository extends JpaRepository<Rol, Long> {

    /**
     * Consulta por coincidencia exacta del nombre persistido.
     *
     * @param nombre nombre exacto que se consulta
     * @return entidad encontrada o Optional vacío
     * @throws org.springframework.dao.DataAccessException si falla el acceso a persistencia
     */
    Optional<Rol> findByNombre(String nombre);
}
