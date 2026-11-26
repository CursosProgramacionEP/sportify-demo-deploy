package com.sportify.backend.model;

import java.io.Serializable;
import java.util.Objects;

/** Clave compuesta que identifica la membresía de un usuario en un equipo. */
public class EquipoJugadorId implements Serializable{

    private Long idEquipo;
    private Long idUsuario;

    public EquipoJugadorId() {
    }

    public EquipoJugadorId(Long idEquipo, Long idUsuario) {
        this.idEquipo = idEquipo;
        this.idUsuario = idUsuario;
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof EquipoJugadorId)) return false;
        EquipoJugadorId that = (EquipoJugadorId) o;
        return Objects.equals(idEquipo, that.idEquipo) && Objects.equals(idUsuario, that.idUsuario);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idEquipo, idUsuario);
    }

}
