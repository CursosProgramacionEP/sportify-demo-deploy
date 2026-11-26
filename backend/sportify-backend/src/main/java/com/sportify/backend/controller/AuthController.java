package com.sportify.backend.controller;

import com.sportify.backend.dto.*;
import com.sportify.backend.service.AuthService;
import com.sportify.backend.service.UsuarioService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;
import org.springframework.web.bind.annotation.*;

/** Autenticación con cookie HttpOnly; el navegador no almacena contraseñas ni tokens de acceso.
 * @author Equipo Sportify
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth;
    private final UsuarioService usuarios;
    private final SecurityContextRepository repository;

    /**
     * Vincula la autenticación con la sesión administrada por Spring Security.
     * @param auth verificador de credenciales y registro
     * @param usuarios proyección segura de cuentas
     * @param repository almacenamiento del contexto en sesión
     */
    public AuthController(AuthService auth, UsuarioService usuarios, SecurityContextRepository repository) {
        this.auth = auth;
        this.usuarios = usuarios;
        this.repository = repository;
    }

    /**
     * Prepara la protección de una solicitud de escritura del navegador.
     * @param token token asociado a la sesión HTTP
     * @return token y nombre de la cabecera que debe enviarse
     */
    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken token) {
        return Map.of("token", token.getToken(), "headerName", token.getHeaderName());
    }

    /**
     * Registra una cuenta CLIENTE sin aceptar privilegios del solicitante.
     * @param datos datos personales validados
     * @return identificador y confirmación, sin contraseña
     * @throws org.springframework.web.server.ResponseStatusException si el alta es rechazada
     */
    @PostMapping("/register")
    public Map<String, Object> registrar(@Valid @RequestBody UsuarioDatos.Registro datos) {
        return Map.of("idUsuario", auth.registrarUsuario(datos).getIdUsuario(), "message", "Usuario registrado correctamente.");
    }

    /**
     * Autentica la cuenta y renueva la identidad de sesión y el token CSRF.
     * @param datos credenciales validadas
     * @param request petición cuya sesión se renueva
     * @param response respuesta usada para guardar el contexto de seguridad
     * @return cuenta autenticada con sus roles actuales
     * @throws org.springframework.web.server.ResponseStatusException si las credenciales no son válidas
     */
    @PostMapping("/login")
    public UsuarioResumen login(@Valid @RequestBody UsuarioDatos.Acceso datos,
            HttpServletRequest request, HttpServletResponse response) {
        var usuario = auth.autenticar(datos.correo(), datos.contrasena());
        var resumen = usuarios.resumen(usuario.getIdUsuario());
        if (request.getSession(false) != null) request.changeSessionId();
        var context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(UsernamePasswordAuthenticationToken.authenticated(usuario.getIdUsuario(), null,
                resumen.roles().stream().map(rol -> new SimpleGrantedAuthority("ROLE_" + rol)).toList()));
        SecurityContextHolder.setContext(context);
        repository.saveContext(context, request, response);
        new HttpSessionCsrfTokenRepository().saveToken(null, request, response);
        return resumen;
    }

    /**
     * Inicia el flujo de recuperación de contraseña.
     * Responde siempre 200 con el mismo mensaje para no revelar si el correo existe.
     *
     * @param datos correo electrónico validado
     * @return confirmación genérica
     */
    @PostMapping("/recuperar")
    public Map<String, String> recuperar(@Valid @RequestBody UsuarioDatos.RecuperarContrasena datos) {
        return Map.of("message",
            "Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.");
    }

    /**
     * Recupera la cuenta de la sesión comprobada por el filtro de seguridad.
     * @param authentication identidad autenticada por el servidor
     * @return datos actuales, estado y roles
     */
    @GetMapping("/me")
    public UsuarioResumen actual(Authentication authentication) {
        return usuarios.resumen((Long) authentication.getPrincipal());
    }
}
