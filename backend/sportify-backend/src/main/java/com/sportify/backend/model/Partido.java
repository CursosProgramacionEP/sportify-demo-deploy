package com.sportify.backend.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Partido del historial de un equipo. El rival es texto libre; no requiere
 * cuenta ni equipo en Sportify. El resultado se calcula al exponerlo.
 *
 * @author Equipo Sportify
 */
@Entity 
@Table (name = "partido")
public class Partido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_partido")
    private Long idPartido;

    @Column(name = "id_equipo", nullable = false)
    private Long idEquipo;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "rival", nullable = false, length = 100)
    private String rival;

    @Column(name = "goles_favor", nullable = false)
    private Integer golesFavor;

    @Column(name = "goles_contra", nullable = false)
    private Integer golesContra;

    @Column(name = "observaciones", length = 255)
    private String observaciones;

    @Column(name = "id_usuario_registrador", nullable = false)
    private Long idUsuarioRegistrador;

    public Partido() {
    }

    public Partido(Long idEquipo, LocalDate fecha, String rival,
            Integer golesFavor, Integer golesContra, String observaciones,
            Long idUsuarioRegistrador) {
        this.idEquipo = idEquipo;
        this.fecha = fecha;
        this.rival = rival;
        this.golesFavor = golesFavor;
        this.golesContra = golesContra;
        this.observaciones = observaciones;
        this.idUsuarioRegistrador = idUsuarioRegistrador;
    }

    public Long getIdPartido() {
        return idPartido;
    }

    public void setIdPartido(Long idPartido) {
        this.idPartido = idPartido;
    }

    public Long getIdEquipo() {
        return idEquipo;
    }

    public void setIdEquipo(Long idEquipo) {
        this.idEquipo = idEquipo;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public String getRival() {
        return rival;
    }

    public void setRival(String rival) {
        this.rival = rival;
    }

    public Integer getGolesFavor() {
        return golesFavor;
    }

    public void setGolesFavor(Integer golesFavor) {
        this.golesFavor = golesFavor;
    }

    public Integer getGolesContra() {
        return golesContra;
    }

    public void setGolesContra(Integer golesContra) {
        this.golesContra = golesContra;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public Long getIdUsuarioRegistrador() {
        return idUsuarioRegistrador;
    }

    public void setIdUsuarioRegistrador(Long idUsuarioRegistrador) {
        this.idUsuarioRegistrador = idUsuarioRegistrador;
    }

    
}
