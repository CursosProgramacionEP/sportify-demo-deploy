package com.sportify.backend.repository;

import com.sportify.backend.model.Cancha;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Acceso a datos para las canchas deportivas.
 * 
 * @author Equipo Sportify
 */
public interface CanchaRepository extends JpaRepository<Cancha, Long> {
    
    /**
     * Obtiene todas las canchas asociadas a un complejo específico.
     * 
     * @param idComplejo Identificador del complejo.
     * @return Lista de canchas (puede estar vacía).
     */
    List<Cancha> findByIdComplejo(Long idComplejo);

    /**
     * Verifica si existe una cancha con ese nombre en un complejo (para evitar duplicados).
     * 
     * @param idComplejo Identificador del complejo.
     * @param nombre Nombre de la cancha.
     * @return true si ya existe, false en caso contrario.
     */
    boolean existsByIdComplejoAndNombre(Long idComplejo, String nombre);

    /**
     * Lista las canchas filtradas por estado exacto ({@code ACTIVA} o {@code INACTIVA}).
     *
     * @param estado estado a filtrar
     * @return canchas coincidentes; lista vacía si no hay ninguna
     */
    List<Cancha> findByEstado(String estado);

        /**
     * Busca la cancha bloqueando su fila hasta que termine la transacción, de modo que
     * dos reservas simultáneas de la misma cancha se validen una por una.
     *
     * @param id identificador de la cancha
     * @return la cancha bloqueada, o vacío si no existe
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Cancha c where c.idCancha = :id")
    Optional<Cancha> buscarParaReservar(@Param("id") Long id);
}