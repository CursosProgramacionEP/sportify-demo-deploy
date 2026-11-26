package com.sportify.backend.config;

import com.sportify.backend.service.UsuarioService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.intercept.AuthorizationFilter;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

/**
 * Sesiones HTTP, CSRF y autorización efectiva en el servidor.
 * 
 * @author Equipo Sportify
 */
@Configuration
public class SecurityConfig {
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, UsuarioService usuarios,
            SecurityContextRepository repository) throws Exception {
        var cors = new CorsConfiguration();
        cors.setAllowedOrigins(List.of("http://localhost:5173"));
        cors.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cors.setAllowedHeaders(List.of("Content-Type", "Accept", "X-CSRF-TOKEN"));
        cors.setAllowCredentials(true);
        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cors);

        var csrfHandler = new CsrfTokenRequestAttributeHandler();
        csrfHandler.setCsrfRequestAttributeName(null);

        http.cors(config -> config.configurationSource(source))
                .csrf(config -> config.csrfTokenRequestHandler(csrfHandler))
                .securityContext(config -> config.securityContextRepository(repository))
                .requestCache(config -> config.disable())
                .formLogin(config -> config.disable())
                .httpBasic(config -> config.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/csrf", "/api/auth/login", "/api/auth/register",
                                "/api/auth/recuperar", "/error")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/canchas", "/api/canchas/*/disponibilidad",
                                "/api/complejos")
                        .permitAll()
                        .requestMatchers("/api/auth/me").authenticated()
                        .requestMatchers("/api/equipos/**").authenticated()
                        .requestMatchers("/api/reservas/**").hasAnyRole("CLIENTE", "ADMIN_COMPLEJO", "ADMIN_PLATAFORMA")
                        .requestMatchers("/api/canchas/**", "/api/complejos/**")
                        .hasAnyRole("ADMIN_PLATAFORMA", "ADMIN_COMPLEJO")
                        .requestMatchers("/api/**").hasRole("ADMIN_PLATAFORMA")
                        .anyRequest().denyAll())
                .exceptionHandling(config -> config
                        .authenticationEntryPoint(
                                (req, res, ex) -> jsonError(res, 401, "Inicia sesión para continuar."))
                        .accessDeniedHandler((req, res, ex) -> jsonError(res, 403,
                                "No tienes permiso o la sesión de seguridad ha caducado.")))
                .logout(config -> config.logoutUrl("/api/auth/logout")
                        .invalidateHttpSession(true).deleteCookies("JSESSIONID")
                        .logoutSuccessHandler((req, res, auth) -> res.setStatus(204)))
                .addFilterBefore(new OncePerRequestFilter() {
                    @Override
                    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                            FilterChain chain) throws ServletException, IOException {
                        var auth = SecurityContextHolder.getContext().getAuthentication();
                        if (auth != null && auth.getPrincipal() instanceof Long id) {
                            try {
                                var usuario = usuarios.resumen(id);
                                if (!"ACTIVO".equals(usuario.estado())) {
                                    invalidar(request);
                                } else {
                                    var context = SecurityContextHolder.createEmptyContext();
                                    context.setAuthentication(
                                            UsernamePasswordAuthenticationToken.authenticated(id, null,
                                                    usuario.roles().stream()
                                                            .map(rol -> new SimpleGrantedAuthority("ROLE_" + rol))
                                                            .toList()));
                                    SecurityContextHolder.setContext(context);
                                }
                            } catch (ResponseStatusException ex) {
                                if (ex.getStatusCode().value() != 404)
                                    throw ex;
                                invalidar(request);
                            }
                        }
                        chain.doFilter(request, response);
                    }
                }, AuthorizationFilter.class);
        // CSRF permanece habilitado, también para login y registro.
        return http.build();
    }

    private static void invalidar(HttpServletRequest request) {
        SecurityContextHolder.clearContext();
        var session = request.getSession(false);
        if (session != null)
            session.invalidate();
    }

    private static void jsonError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"message\":\"" + message + "\"}");
    }
}
