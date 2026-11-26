package com.sportify.backend.model;

import java.time.LocalDate;
import java.time.ZoneId;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

/**
 * Relación entre un equipo y un usuario miembro. El rol dentro del equipo
 * (CAPITAN o JUGADOR) es independiente del rol del sistema (CLIENTE, ADMIN_PLATAFORMA, ADMIN_COMPLEJO).
 *
 * @author Equipo Sportify
 */
@Entity
@Table(name = "equipo_jugador")
@IdClass(EquipoJugadorId.class)
public class EquipoJugador {
    
    @Id
    @Column(name = "id_equipo")
    private Long idEquipo;

    @Id
    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(name = "rol_equipo", nullable = false, length = 20)
    private String rolEquipo = "JUGADOR";

    @Column(name = "fecha_ingreso", updatable = false)
    private LocalDate fechaIngreso;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_equipo", insertable = false, updatable = false)
    private Equipo equipo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", insertable = false, updatable = false)
    private Usuario usuario;

    /** Registra la fecha de ingreso según el calendario de Perú. */
    @PrePersist
    void registrarFechaIngreso() {
        fechaIngreso = LocalDate.now(ZoneId.of("America/Lima"));
    }

    public EquipoJugador() {
    }

    public EquipoJugador(Long idEquipo, Long idUsuario, String rolEquipo) {
        this.idEquipo = idEquipo;
        this.idUsuario = idUsuario;
        this.rolEquipo = rolEquipo;
    }

    public Long getIdEquipo() {
        return idEquipo;
    }

    public void setIdEquipo(Long idEquipo) {
        this.idEquipo = idEquipo;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getRolEquipo() {
        return rolEquipo;
    }

    public void setRolEquipo(String rolEquipo) {
        this.rolEquipo = rolEquipo;
    }

    public LocalDate getFechaIngreso() {
        return fechaIngreso;
    }

    public void setFechaIngreso(LocalDate fechaIngreso) {
        this.fechaIngreso = fechaIngreso;
    }

    public Equipo getEquipo() {
        return equipo;
    }

    public void setEquipo(Equipo equipo) {
        this.equipo = equipo;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
    
    
}
