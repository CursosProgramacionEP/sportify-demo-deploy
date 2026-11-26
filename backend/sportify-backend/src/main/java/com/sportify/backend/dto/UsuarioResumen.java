package com.sportify.backend.dto;

import java.util.List;

/** Vista pública de una cuenta; nunca contiene la contraseña ni su hash.
 * @author Equipo Sportify
 */
public record UsuarioResumen(Long idUsuario, String nombres, String apellidos,
        String telefono, String correo, String estado, List<String> roles) { }
