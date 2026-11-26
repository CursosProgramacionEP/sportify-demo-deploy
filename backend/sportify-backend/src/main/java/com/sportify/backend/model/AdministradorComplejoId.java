package com.sportify.backend.model;

import java.io.Serializable;
import java.util.Objects;

/** Clave compuesta de una asociación usuario-complejo. */
public class AdministradorComplejoId implements Serializable {

    private Long idUsuario;
    private Long idComplejo;

    public AdministradorComplejoId() {
    }

    public AdministradorComplejoId(Long idUsuario, Long idComplejo) {
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;

        if (!(o instanceof AdministradorComplejoId)) {
            return false;
        }
        AdministradorComplejoId that =(AdministradorComplejoId) o;
        return Objects.equals(idUsuario, that.idUsuario) && Objects.equals(idComplejo, that.idComplejo);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idUsuario, idComplejo);
    }
}
