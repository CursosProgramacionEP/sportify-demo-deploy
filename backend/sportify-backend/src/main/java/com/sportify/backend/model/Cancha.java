package com.sportify.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

/** Cancha perteneciente a un complejo, con precio, capacidad y estado. */
@Entity
@Table(name = "cancha")
public class Cancha {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cancha")
    private Long idCancha;

    @Column(name = "id_complejo", nullable = false)
    private Long idComplejo;

    @Column(nullable = false)
    private String nombre;

    @Column(name = "precio_hora", nullable = false)
    private BigDecimal precioHora;

    @NotNull
    @Min(1)
    @Column(name = "capacidad", nullable = false)
    private Integer capacidad;

    @Column(nullable = false)
    private String estado = "ACTIVA";

    public Cancha() {}
    public Cancha(Long idComplejo, String nombre, BigDecimal precioHora,Integer capacidad, String estado) {
        this.idComplejo = idComplejo;
        this.nombre = nombre;
        this.precioHora = precioHora;
        this.estado = estado;
        this.capacidad=capacidad;
    }

    public Long getIdCancha() { return idCancha; }
    public void setIdCancha(Long idCancha) { this.idCancha = idCancha; }
    public Long getIdComplejo() { return idComplejo; }
    public void setIdComplejo(Long idComplejo) { this.idComplejo = idComplejo; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public BigDecimal getPrecioHora() { return precioHora; }
    public void setPrecioHora(BigDecimal precioHora) { this.precioHora = precioHora; }
    public Integer getCapacidad() { return capacidad; }
    public void setCapacidad(Integer capacidad) { this.capacidad = capacidad; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}
