package com.sportify.backend;

import com.sportify.backend.dto.UsuarioDatos;
import com.sportify.backend.model.*;
import com.sportify.backend.repository.*;
import com.sportify.backend.service.*;
import jakarta.persistence.EntityManager;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UsuarioServiceTests {
    final UsuarioRepository usuarios = mock(UsuarioRepository.class);
    final RolRepository roles = mock(RolRepository.class);
    final UsuarioRolRepository asignaciones = mock(UsuarioRolRepository.class);
    final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    final AuthService auth = new AuthService(usuarios, roles, asignaciones, encoder);

    Usuario cuenta() {
        Usuario usuario = new Usuario();
        usuario.setIdUsuario(1L);
        usuario.setPassword("Prueba123");
        when(usuarios.findByCorreoIgnoreCase("ana@example.com")).thenReturn(Optional.of(usuario));
        return usuario;
    }

    @Test void claveAntiguaSeMigraSinAceptarElHashComoClave() {
        Usuario usuario = cuenta();
        auth.autenticar("ana@example.com", "Prueba123");
        assertTrue(encoder.matches("Prueba123", usuario.getPassword()));
        assertThrows(ResponseStatusException.class, () -> auth.autenticar("ana@example.com", usuario.getPassword()));
        auth.autenticar("ana@example.com", "Prueba123");
    }

    @Test void claveIncorrectaOCuentaInactivaNoSeAceptan() {
        Usuario usuario = cuenta();
        assertThrows(ResponseStatusException.class, () -> auth.autenticar("ana@example.com", "incorrecta"));
        usuario.setEstado("INACTIVO");
        assertThrows(ResponseStatusException.class, () -> auth.autenticar("ana@example.com", "Prueba123"));
        verify(usuarios, never()).save(any());
    }

    @Test void registroAsignaSoloClienteYNoGuardaTextoPlano() {
        Rol cliente = new Rol("CLIENTE"); cliente.setIdRol(2L);
        when(roles.findByNombre("CLIENTE")).thenReturn(Optional.of(cliente));
        when(usuarios.save(any())).thenAnswer(call -> { Usuario u = call.getArgument(0); u.setIdUsuario(7L); return u; });
        var usuario = auth.registrarUsuario(new UsuarioDatos.Registro("Ana", "Pérez", "ANA@example.com", "999999999", "Prueba123"));
        assertEquals("ana@example.com", usuario.getCorreo());
        assertEquals("ACTIVO", usuario.getEstado());
        assertTrue(encoder.matches("Prueba123", usuario.getPassword()));
        verify(asignaciones).save(argThat(item -> item.getIdUsuario().equals(7L) && item.getIdRol().equals(2L)));
    }

    @Test void administradorNoPuedeDesactivarseNiDejarElSistemaSinAdministrador() {
        Usuario usuario = cuenta();
        Rol plataforma = new Rol("ADMIN_PLATAFORMA"); plataforma.setIdRol(3L);
        UsuarioRol relacion = new UsuarioRol(1L, 3L); relacion.setRol(plataforma);
        when(roles.findByNombre("ADMIN_PLATAFORMA")).thenReturn(Optional.of(plataforma));
        when(usuarios.findById(1L)).thenReturn(Optional.of(usuario));
        when(asignaciones.findByIdUsuario(1L)).thenReturn(List.of(relacion));
        when(asignaciones.contarAdministradoresActivos()).thenReturn(1L);
        UsuarioService service = new UsuarioService(usuarios, asignaciones, roles, mock(EntityManager.class));
        assertThrows(ResponseStatusException.class, () -> service.cambiarEstado(1L, "INACTIVO", 1L));
        assertThrows(ResponseStatusException.class, () -> service.cambiarEstado(1L, "INACTIVO", 2L));
        verify(usuarios, never()).save(any());
    }

    @Test void correoDuplicadoNoActualizaLaCuenta() {
        Usuario usuario = cuenta();
        when(usuarios.findById(1L)).thenReturn(Optional.of(usuario));
        when(usuarios.existsByCorreoIgnoreCaseAndIdUsuarioNot("otro@example.com", 1L)).thenReturn(true);
        UsuarioService service = new UsuarioService(usuarios, asignaciones, roles, mock(EntityManager.class));
        assertThrows(ResponseStatusException.class, () -> service.editar(1L, new UsuarioDatos.Edicion("Ana", "Pérez", "otro@example.com", "")));
        verify(usuarios, never()).save(any());
    }

    @Test void concederRolDevuelveLaRelacionRecienCreadaConSuNombre() {
        Usuario usuario = cuenta();
        Rol plataforma = new Rol("ADMIN_PLATAFORMA"); plataforma.setIdRol(3L);
        when(usuarios.findById(1L)).thenReturn(Optional.of(usuario));
        when(roles.findByNombre("ADMIN_PLATAFORMA")).thenReturn(Optional.of(plataforma));
        when(asignaciones.save(any())).thenAnswer(call -> {
            UsuarioRol relacion = call.getArgument(0);
            when(asignaciones.findByIdUsuario(1L)).thenReturn(List.of(relacion));
            return relacion;
        });
        UsuarioService service = new UsuarioService(usuarios, asignaciones, roles, mock(EntityManager.class));
        assertEquals(List.of("ADMIN_PLATAFORMA"), service.cambiarRolPlataforma(1L, true, 2L).roles());
    }
}
