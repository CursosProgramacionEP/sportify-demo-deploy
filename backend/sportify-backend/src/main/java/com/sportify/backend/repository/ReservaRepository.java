package com.sportify.backend.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.sportify.backend.model.EstadoReserva;
import com.sportify.backend.model.Reserva;

/**
 * Acceso a datos de reservas. Las canceladas no cuentan como ocupadas.
 *
 * @author Equipo Sportify
 */
public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    /**
     * Cuenta las reservas no canceladas que se cruzan con la franja indicada.
     * Dos franjas se cruzan cuando cada una empieza antes de que la otra termine.
     *
     * @param idCancha cancha consultada
     * @param fecha día de la franja
     * @param inicio hora de inicio de la franja
     * @param fin hora de fin de la franja
     * @param excluirId reserva que se ignora al modificar; usar 0 al crear
     * @return cantidad de reservas en conflicto
     */
    @Query("""
            select count(r) from Reserva r
            where r.idCancha = :idCancha
              and r.fecha = :fecha
              and r.estado <> com.sportify.backend.model.EstadoReserva.CANCELADA
              and r.horaInicio < :fin
              and r.horaFin > :inicio
              and r.idReserva <> :excluirId
            """)
    long contarConflictos(@Param("idCancha") Long idCancha,
                          @Param("fecha") LocalDate fecha,
                          @Param("inicio") LocalTime inicio,
                          @Param("fin") LocalTime fin,
                          @Param("excluirId") Long excluirId);

    /**
     * Lista las reservas de una cancha en un día, excluyendo un estado.
     *
     * @param idCancha cancha consultada
     * @param fecha día consultado
     * @param estado estado que se descarta
     * @return reservas coincidentes; lista vacía si no hay
     */
    List<Reserva> findByIdCanchaAndFechaAndEstadoNot(Long idCancha, LocalDate fecha, EstadoReserva estado);

    /**
     * Lista las reservas de un usuario, de la más reciente a la más antigua.
     *
     * @param idUsuario usuario dueño de las reservas
     * @return reservas del usuario; lista vacía si no tiene
     */
    List<Reserva> findByIdUsuarioOrderByFechaDescHoraInicioDesc(Long idUsuario);

    /**
     * Lista todas las reservas de las canchas de un complejo.
     *
     * @param idComplejo complejo consultado
     * @return reservas del complejo, de la más reciente a la más antigua
     */
    @Query("""
            select r from Reserva r
            where r.idCancha in (select c.idCancha from Cancha c where c.idComplejo = :idComplejo)
            order by r.fecha desc, r.horaInicio desc
            """)
    List<Reserva> listarPorComplejo(@Param("idComplejo") Long idComplejo);

    /**
     * Lista las reservas de un complejo en una fecha concreta.
     *
     * @param idComplejo complejo consultado
     * @param fecha día consultado
     * @return reservas de ese día ordenadas por hora
     */
    @Query("""
            select r from Reserva r
            where r.idCancha in (select c.idCancha from Cancha c where c.idComplejo = :idComplejo)
              and r.fecha = :fecha
            order by r.horaInicio
            """)
    List<Reserva> listarPorComplejoYFecha(@Param("idComplejo") Long idComplejo,
                                          @Param("fecha") LocalDate fecha);
}