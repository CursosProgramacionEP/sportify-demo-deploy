package com.sportify.backend.repository;

import com.sportify.backend.model.Auditoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Acceso a datos para el registro de auditoría.
 * Permite consultar el historial de acciones realizadas en el sistema.
 * 
 * @author Equipo Sportify
 */
@Repository
public interface AuditoriaRepository extends JpaRepository<Auditoria, Long> {
    
    /**
     * Recupera las últimas 10 acciones registradas en el sistema, 
     * ordenadas desde la más reciente hasta la más antigua.
     * Utilizado principalmente para el panel de actividad del Dashboard.
     * 
     * @return Lista de las últimas 10 auditorías; lista vacía si no hay registros.
     */
    List<Auditoria> findTop10ByOrderByFechaDesc();
}