package com.sportify.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/** Entrada persistida del historial de acciones administrativas. */
@Entity
@Table(name = "auditoria")
public class Auditoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String accion; 
    private String detalle; 
    
    @Column(name = "fecha", nullable = false)
    private LocalDateTime fecha = LocalDateTime.now();

    public Auditoria() {}
    public Auditoria(String accion, String detalle) {
        this.accion = accion;
        this.detalle = detalle;
    }

    public Long getId() { return id; }
    public String getAccion() { return accion; }
    public void setAccion(String accion) { this.accion = accion; }
    public String getDetalle() { return detalle; }
    public void setDetalle(String detalle) { this.detalle = detalle; }
    public LocalDateTime getFecha() { return fecha; }
    public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }
}
