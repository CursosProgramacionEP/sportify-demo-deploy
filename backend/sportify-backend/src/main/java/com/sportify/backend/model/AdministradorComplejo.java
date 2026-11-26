package com.sportify.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.ZoneId;

/** Asociación entre una cuenta de usuario y un complejo administrado. */
@Entity
@Table(name = "administrador_complejo")
@IdClass(AdministradorComplejoId.class)
public class AdministradorComplejo {

    @Id
    @Column(name = "id_usuario")
    private Long idUsuario;

    @Id
    @Column(name = "id_complejo")
    private Long idComplejo;

    @Column(name = "fecha_asignacion", updatable = false)
    private LocalDate fechaAsignacion;

    /** Registra la fecha de la nueva asociación según el calendario de Perú. */
    @PrePersist
    void registrarFechaAsignacion() {
        fechaAsignacion = LocalDate.now(ZoneId.of("America/Lima"));
    }

    /**
     * Permite consultar la fecha sin modificarla desde las solicitudes de la API.
     * @return fecha de asignación o null para registros históricos sin fecha
     */
    public LocalDate getFechaAsignacion() {
        return fechaAsignacion;
    }

    public AdministradorComplejo() {
    }

    public AdministradorComplejo(Long idUsuario, Long idComplejo) {
        this.idUsuario = idUsuario;
        this.idComplejo = idComplejo;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public Long getIdComplejo() {
        return idComplejo;
    }

    public void setIdComplejo(Long idComplejo) {
        this.idComplejo = idComplejo;
    }
}
