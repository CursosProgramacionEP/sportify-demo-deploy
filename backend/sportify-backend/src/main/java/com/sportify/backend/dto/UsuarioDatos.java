package com.sportify.backend.dto;

import jakarta.validation.constraints.*;

/** Contratos explícitos para evitar que una solicitud modifique IDs, claves o roles no autorizados.
 * @author Equipo Sportify
 */
public final class UsuarioDatos {
    private UsuarioDatos() { }

    /** Datos personales y credencial requeridos por el registro público. */
    public record Registro(
            @NotBlank @Size(max = 100) String nombres,
            @NotBlank @Size(max = 100) String apellidos,
            @NotBlank @Email @Size(max = 150) String correo,
            @NotBlank @Pattern(regexp = "[0-9]{9}") String telefono,
            @NotBlank @Size(min = 8, max = 72) String contrasena) { }

    /** Credenciales para iniciar sesión. */
    public record Acceso(@NotBlank @Email String correo, @NotBlank String contrasena) { }

    /** Datos personales editables; el teléfono puede ser {@code null} o vacío. */
    public record Edicion(
            @NotBlank @Size(max = 100) String nombres,
            @NotBlank @Size(max = 100) String apellidos,
            @NotBlank @Email @Size(max = 150) String correo,
            @Pattern(regexp = "[0-9]{9}|", message = "debe tener nueve dígitos") String telefono) { }

    /** Estado admitido para una cuenta. */
    public record Estado(@NotNull @Pattern(regexp = "ACTIVO|INACTIVO") String estado) { }

    /** Indica si debe concederse o retirarse el rol de plataforma. */
    public record RolPlataforma(@NotNull Boolean administrador) { }

    /** Correo recibido por el endpoint de solicitud de recuperación. */
    public record RecuperarContrasena(@NotBlank @Email String correo) { }
}
