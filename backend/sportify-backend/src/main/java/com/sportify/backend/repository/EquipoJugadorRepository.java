package com.sportify.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.sportify.backend.model.EquipoJugador;
import com.sportify.backend.model.EquipoJugadorId;

/**
 * Accede a las membresías equipo-usuario para listar planteles, contar
 * integrantes y validar límites por usuario.
 *
 * @author Equipo Sportify
 */
public interface EquipoJugadorRepository extends JpaRepository<EquipoJugador, EquipoJugadorId> {

    /**
     * Lista los miembros de un equipo.
     *
     * @param idEquipo identificador del equipo
     * @return membresías del equipo; lista vacía si no tiene
     */
    List<EquipoJugador> findByIdEquipo(Long idEquipo);

    /**
     * Lista las membresías del usuario, útil para "mis equipos" y para
     * validar límites de pertenencia.
     *
     * @param idUsuario identificador del usuario
     * @return membresías del usuario; lista vacía si no tiene
     */
    List<EquipoJugador> findByIdUsuario(Long idUsuario);

    /**
     * Recupera la membresía concreta para validar retiro o transferencia.
     *
     * @param idEquipo identificador del equipo
     * @param idUsuario identificador del usuario
     * @return membresía encontrada o Optional vacío
     */
    Optional<EquipoJugador> findByIdEquipoAndIdUsuario(Long idEquipo, Long idUsuario);

    /**
     * Comprueba si el usuario ya pertenece al equipo.
     *
     * @param idEquipo identificador del equipo
     * @param idUsuario identificador del usuario   
     * @return true si la membresía existe
     */
    boolean existsByIdEquipoAndIdUsuario(Long idEquipo, Long idUsuario);

    /**
     * Cuenta los integrantes actuales del equipo para validar el máximo de 20.
     *
     * @param idEquipo identificador del equipo
     * @return número de integrantes
     */
    long countByIdEquipo(Long idEquipo);

    /**
     * Cuenta los equipos ACTIVO donde el usuario es miembro, para validar el
     * límite de 5 equipos activos por usuario.
     *
     * @param idUsuario identificador del usuario
     * @return número de equipos activos donde pertenece
     */
    @Query("select count(ej) from EquipoJugador ej where ej.idUsuario = :idUsuario and ej.equipo.estado = 'ACTIVO'")
    long countEquiposActivosPorUsuario(@Param("idUsuario") Long idUsuario);

}
