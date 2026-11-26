package com.sportify.backend.model;

import java.time.LocalDate;
import java.time.ZoneId;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

/** Equipo creado por una cuenta responsable; su fecha se asigna al persistir. */
@Entity
@Table(name = "equipo")
public class Equipo {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_equipo")
    private Long idEquipo;

    @Column(name = "id_usuario_responsable", nullable = false)
    private Long idUsuarioResponsable;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(name = "nivel", nullable = false, length = 20)
    private NivelEquipo nivel = NivelEquipo.PRINCIPIANTE;

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDate fechaCreacion;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado = "ACTIVO";

    @PrePersist 
    void registrarFechaCreacion() {fechaCreacion = LocalDate.now(ZoneId.of("America/Lima"));}

    public Equipo() {}

    public Equipo(Long idUsuarioResponsable, String nombre, NivelEquipo nivel) {
        this.idUsuarioResponsable = idUsuarioResponsable;
        this.nombre = nombre;
        this.nivel = nivel;
    }

    public Long getIdEquipo() {
        return idEquipo;
    }

    public void setIdEquipo(Long idEquipo) {
        this.idEquipo = idEquipo;
    }

    public Long getIdUsuarioResponsable() {
        return idUsuarioResponsable;
    }

    public void setIdUsuarioResponsable(Long idUsuarioResponsable) {
        this.idUsuarioResponsable = idUsuarioResponsable;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public NivelEquipo getNivel() {
        return nivel;
    }

    public void setNivel(NivelEquipo nivel) {
        this.nivel = nivel;
    }

    public LocalDate getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDate fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

}
