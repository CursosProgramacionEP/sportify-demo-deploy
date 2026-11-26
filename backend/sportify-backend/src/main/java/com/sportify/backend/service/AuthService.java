package com.sportify.backend.service;

import com.sportify.backend.dto.UsuarioDatos;
import com.sportify.backend.model.*;
import com.sportify.backend.repository.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/** Registra cuentas CLIENTE y migra las contraseñas antiguas tras un acceso válido.
 * @author Equipo Sportify
 */
@Service
public class AuthService {
    private final UsuarioRepository usuarios;
    private final RolRepository roles;
    private final UsuarioRolRepository asignaciones;
    private final PasswordEncoder encoder;

    /**
     * Coordina persistencia y verificación de contraseñas para el registro público.
     * @param usuarios cuentas registradas
     * @param roles catálogo de roles
     * @param asignaciones relaciones entre cuentas y roles
     * @param encoder generador y verificador de hashes
     */
    public AuthService(UsuarioRepository usuarios, RolRepository roles,
            UsuarioRolRepository asignaciones, PasswordEncoder encoder) {
        this.usuarios = usuarios;
        this.roles = roles;
        this.asignaciones = asignaciones;
        this.encoder = encoder;
    }

    /**
     * Persiste cuenta y rol en una sola transacción; ignora privilegios externos al DTO.
     * @param datos campos validados del registro público
     * @return usuario persistido con contraseña almacenada como hash BCrypt
     * @throws ResponseStatusException si el correo existe, la clave excede el límite o falta CLIENTE
     */
    @Transactional
    public Usuario registrarUsuario(UsuarioDatos.Registro datos) {
        String correo = datos.correo().trim().toLowerCase(Locale.ROOT);
        if (usuarios.findByCorreoIgnoreCase(correo).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El correo ya está registrado.");
        }
        if (datos.contrasena().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contraseña no debe superar 72 bytes UTF-8.");
        }
        Rol cliente = roles.findByNombre("CLIENTE").orElseThrow(() ->
                new ResponseStatusException(HttpStatus.CONFLICT, "Falta configurar el rol CLIENTE."));
        Usuario usuario = new Usuario();
        usuario.setNombres(datos.nombres().trim());
        usuario.setApellidos(datos.apellidos().trim());
        usuario.setCorreo(correo);
        usuario.setTelefono(datos.telefono());
        usuario.setEstado("ACTIVO");
        usuario.setPassword(encoder.encode(datos.contrasena()));
        usuario = usuarios.save(usuario);
        asignaciones.save(new UsuarioRol(usuario.getIdUsuario(), cliente.getIdRol()));
        return usuario;
    }

    /**
     * Comprueba credenciales y estado sin revelar si existe el correo.
     * @param correo dirección recibida
     * @param password contraseña presentada por el usuario
     * @return cuenta activa autenticada
     * @throws ResponseStatusException si la cuenta está inactiva o las credenciales no coinciden
     */
    @Transactional
    public Usuario autenticar(String correo, String password) {
        Usuario usuario = usuarios.findByCorreoIgnoreCase(correo.trim()).orElseThrow(this::rechazo);
        if (!"ACTIVO".equals(usuario.getEstado())) throw rechazo();
        String guardada = usuario.getPassword();
        if (guardada == null || password.getBytes(StandardCharsets.UTF_8).length > 72) throw rechazo();
        boolean hash = guardada.startsWith("$2");
        boolean coincide = hash ? encoder.matches(password, guardada) : MessageDigest.isEqual(
                guardada.getBytes(StandardCharsets.UTF_8), password.getBytes(StandardCharsets.UTF_8));
        if (!coincide) throw rechazo();
        if (!hash) {
            usuario.setPassword(encoder.encode(password));
            usuarios.save(usuario);
        }
        return usuario;
    }

    private ResponseStatusException rechazo() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales incorrectas o cuenta inactiva.");
    }
}
