package com.sportify.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;

/** Cuenta de usuario; la contraseña se acepta al escribir y no se serializa. */
@Entity
@Table(name = "usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long idUsuario;

    private String nombres;
    private String apellidos;
    private String telefono;
    private String correo;

    @Column(nullable = false)
    private String estado = "ACTIVO";
    
    @JsonProperty(value = "contrasena", access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "contrasena")
    private String password;

    // Getters y Setters
    public Long getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Long idUsuario) { this.idUsuario = idUsuario; }

    public String getNombres() { return nombres; }
    public void setNombres(String nombres) { this.nombres = nombres; }

    public String getApellidos() { return apellidos; }
    public void setApellidos(String apellidos) { this.apellidos = apellidos; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}   
