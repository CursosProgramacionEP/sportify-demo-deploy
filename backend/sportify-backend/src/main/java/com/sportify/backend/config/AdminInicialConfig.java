package com.sportify.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.sportify.backend.model.Usuario;
import com.sportify.backend.model.Rol;
import com.sportify.backend.model.UsuarioRol;
import com.sportify.backend.repository.UsuarioRepository;
import com.sportify.backend.repository.RolRepository;
import com.sportify.backend.repository.UsuarioRolRepository;

/** Declara la inicialización de la cuenta administrativa configurada en código. */
@Configuration
public class AdminInicialConfig {

    @Bean
    CommandLineRunner crearAdmin(
            UsuarioRepository usuarioRepository,
            RolRepository rolRepository,
            UsuarioRolRepository usuarioRolRepository) {

        return args -> {
            Rol rol = rolRepository.findByNombre("ADMIN_PLATAFORMA")
                    .orElseGet(() -> rolRepository.save(new Rol("ADMIN_PLATAFORMA")));

            if (rolRepository.findByNombre("ADMIN_COMPLEJO").isEmpty()) {
                rolRepository.save(new Rol("ADMIN_COMPLEJO"));
            }

            if (rolRepository.findByNombre("CLIENTE").isEmpty()) {
                rolRepository.save(new Rol("CLIENTE"));
            }

            // Datos del primer administrador: salen de variables de entorno, nunca del código.
            // Si no están definidas, no se crea ningún administrador.
            String correo = System.getenv("ADMIN_EMAIL");
            String clave = System.getenv("ADMIN_PASSWORD");
            if (correo == null || correo.isBlank() || clave == null || clave.isBlank()) {
                return;
            }

            Usuario usuario = usuarioRepository.findByCorreo(correo)
                    .orElseGet(() -> {
                        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
                        Usuario u = new Usuario();
                        u.setNombres("Administrador");
                        u.setApellidos("Plataforma");
                        u.setCorreo(correo);
                        u.setPassword(encoder.encode(clave));
                        u.setEstado("ACTIVO");
                        return usuarioRepository.save(u);
                    });

            if (usuarioRolRepository.findByIdUsuarioAndIdRol(usuario.getIdUsuario(), rol.getIdRol()).isEmpty()) {
                usuarioRolRepository.save(new UsuarioRol(usuario.getIdUsuario(), rol.getIdRol()));
            }
        };
    }
}
