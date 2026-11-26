package com.sportify.backend;

import com.sportify.backend.dto.EquipoDatos;
import com.sportify.backend.model.Equipo;
import com.sportify.backend.model.EquipoJugador;
import com.sportify.backend.model.NivelEquipo;
import com.sportify.backend.model.Usuario;
import com.sportify.backend.repository.EquipoJugadorRepository;
import com.sportify.backend.repository.EquipoRepository;
import com.sportify.backend.repository.UsuarioRepository;
import com.sportify.backend.service.EquipoService;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

class EquipoServiceTests {

    final UsuarioRepository usuarios = mock(UsuarioRepository.class);
    final EquipoRepository equipos = mock(EquipoRepository.class);
    final EquipoJugadorRepository miembros = mock(EquipoJugadorRepository.class);
    final EquipoService service = new EquipoService(usuarios, equipos, miembros);

    @BeforeEach
    void limpiar() {
        reset(usuarios, equipos, miembros);
    }

    Usuario usuarioActivo(Long id) {
        Usuario u = new Usuario();
        u.setIdUsuario(id);
        u.setEstado("ACTIVO");
        when(usuarios.findById(id)).thenReturn(Optional.of(u));
        return u;
    }

    Equipo equipoDe(Long idEquipo, Long idCapitan, String estado) {
        Equipo e = new Equipo(idCapitan, "Los Tigres", NivelEquipo.INTERMEDIO);
        e.setIdEquipo(idEquipo);
        e.setEstado(estado);
        return e;
    }

    @Test void crearRechazaUsuarioInexistente() {
        when(usuarios.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResponseStatusException.class,
                () -> service.crear(99L, new EquipoDatos.Creacion("Los Tigres", "INTERMEDIO")));
        verify(equipos, never()).save(any());
    }

    @Test void crearRechazaUsuarioInactivo() {
        Usuario u = new Usuario();
        u.setIdUsuario(1L);
        u.setEstado("INACTIVO");
        when(usuarios.findById(1L)).thenReturn(Optional.of(u));
        assertThrows(ResponseStatusException.class,
                () -> service.crear(1L, new EquipoDatos.Creacion("Los Tigres", "INTERMEDIO")));
        verify(equipos, never()).save(any());
    }

    @Test void crearRechazaCuandoSuperaTresEquiposCreados() {
        usuarioActivo(1L);
        when(equipos.countByIdUsuarioResponsable(1L)).thenReturn(3L);
        assertThrows(ResponseStatusException.class,
                () -> service.crear(1L, new EquipoDatos.Creacion("Los Tigres", "INTERMEDIO")));
        verify(equipos, never()).save(any());
    }

    @Test void crearRechazaCuandoSuperaCincoEquiposActivos() {
        usuarioActivo(1L);
        when(equipos.countByIdUsuarioResponsable(1L)).thenReturn(0L);
        when(miembros.countEquiposActivosPorUsuario(1L)).thenReturn(5L);
        assertThrows(ResponseStatusException.class,
                () -> service.crear(1L, new EquipoDatos.Creacion("Los Tigres", "INTERMEDIO")));
        verify(equipos, never()).save(any());
    }

    @Test void crearRechazaNombreDuplicadoDelMismoCapitan() {
        usuarioActivo(1L);
        when(equipos.countByIdUsuarioResponsable(1L)).thenReturn(0L);
        when(miembros.countEquiposActivosPorUsuario(1L)).thenReturn(0L);
        when(equipos.existsByNombreIgnoreCaseAndIdUsuarioResponsable("Los Tigres", 1L)).thenReturn(true);
        assertThrows(ResponseStatusException.class,
                () -> service.crear(1L, new EquipoDatos.Creacion("Los Tigres", "INTERMEDIO")));
        verify(equipos, never()).save(any());
    }

    @Test void crearRegistraAlCreadorComoCapitan() {
        usuarioActivo(1L);
        when(equipos.countByIdUsuarioResponsable(1L)).thenReturn(0L);
        when(miembros.countEquiposActivosPorUsuario(1L)).thenReturn(0L);
        when(equipos.existsByNombreIgnoreCaseAndIdUsuarioResponsable(any(), any())).thenReturn(false);
        when(equipos.save(any(Equipo.class))).thenAnswer(call -> {
            Equipo e = call.getArgument(0);
            e.setIdEquipo(10L);
            return e;
        });
        when(miembros.countByIdEquipo(10L)).thenReturn(1L);

        service.crear(1L, new EquipoDatos.Creacion("Los Tigres", "INTERMEDIO"));

        verify(miembros).save(argThat(m ->
                m.getIdEquipo().equals(10L) && m.getIdUsuario().equals(1L) && "CAPITAN".equals(m.getRolEquipo())));
    }

    @Test void obtenerRechazaSiNoEsMiembro() {
        when(equipos.findById(10L)).thenReturn(Optional.of(equipoDe(10L, 1L, "ACTIVO")));
        when(miembros.existsByIdEquipoAndIdUsuario(10L, 2L)).thenReturn(false);
        assertThrows(ResponseStatusException.class, () -> service.obtener(10L, 2L));
    }

    @Test void editarRechazaSiNoEsCapitan() {
        when(equipos.findById(10L)).thenReturn(Optional.of(equipoDe(10L, 1L, "ACTIVO")));
        assertThrows(ResponseStatusException.class,
                () -> service.editar(10L, 2L, new EquipoDatos.Edicion("Nuevo Nombre")));
        verify(equipos, never()).save(any());
    }

    @Test void editarRechazaNombreDuplicadoDelMismoCapitan() {
        when(equipos.findById(10L)).thenReturn(Optional.of(equipoDe(10L, 1L, "ACTIVO")));
        when(equipos.existsByNombreIgnoreCaseAndIdUsuarioResponsableAndIdEquipoNot("Nuevo", 1L, 10L))
                .thenReturn(true);
        assertThrows(ResponseStatusException.class,
                () -> service.editar(10L, 1L, new EquipoDatos.Edicion("Nuevo")));
        verify(equipos, never()).save(any());
    }

    @Test void cambiarNivelRechazaNivelInvalido() {
        when(equipos.findById(10L)).thenReturn(Optional.of(equipoDe(10L, 1L, "ACTIVO")));
        assertThrows(ResponseStatusException.class, () -> service.cambiarNivel(10L, 1L, "EXPERTO"));
        verify(equipos, never()).save(any());
    }

    @Test void cambiarEstadoRechazaEstadoInvalido() {
        when(equipos.findById(10L)).thenReturn(Optional.of(equipoDe(10L, 1L, "ACTIVO")));
        assertThrows(ResponseStatusException.class, () -> service.cambiarEstado(10L, 1L, "OTRO"));
        verify(equipos, never()).save(any());
    }

    @Test void cambiarEstadoAlReactivarRechazaSiUnMiembroSuperaCinco() {
        when(equipos.findById(10L)).thenReturn(Optional.of(equipoDe(10L, 1L, "INACTIVO")));
        EquipoJugador m1 = new EquipoJugador(10L, 1L, "CAPITAN");
        EquipoJugador m2 = new EquipoJugador(10L, 2L, "JUGADOR");
        when(miembros.findByIdEquipo(10L)).thenReturn(List.of(m1, m2));
        when(miembros.countEquiposActivosPorUsuario(1L)).thenReturn(2L);
        when(miembros.countEquiposActivosPorUsuario(2L)).thenReturn(5L);

        assertThrows(ResponseStatusException.class, () -> service.cambiarEstado(10L, 1L, "ACTIVO"));
        verify(equipos, never()).save(any());
    }

    @Test void transferirRechazaApuntarseASiMismo() {
        when(equipos.findById(10L)).thenReturn(Optional.of(equipoDe(10L, 1L, "ACTIVO")));
        assertThrows(ResponseStatusException.class, () -> service.transferirCapitan(10L, 1L, 1L));
        verify(equipos, never()).save(any());
    }

    @Test void transferirRechazaSiElNuevoCapitanNoEsMiembro() {
        when(equipos.findById(10L)).thenReturn(Optional.of(equipoDe(10L, 1L, "ACTIVO")));
        when(miembros.findByIdEquipoAndIdUsuario(10L, 2L)).thenReturn(Optional.empty());
        assertThrows(ResponseStatusException.class, () -> service.transferirCapitan(10L, 1L, 2L));
        verify(equipos, never()).save(any());
    }

    @Test void transferirIntercambiaRolesYActualizaResponsable() {
        Equipo equipo = equipoDe(10L, 1L, "ACTIVO");
        when(equipos.findById(10L)).thenReturn(Optional.of(equipo));
        EquipoJugador capitanActual = new EquipoJugador(10L, 1L, "CAPITAN");
        EquipoJugador nuevoCapitan = new EquipoJugador(10L, 2L, "JUGADOR");
        when(miembros.findByIdEquipoAndIdUsuario(10L, 2L)).thenReturn(Optional.of(nuevoCapitan));
        when(miembros.findByIdEquipoAndIdUsuario(10L, 1L)).thenReturn(Optional.of(capitanActual));
        when(miembros.countByIdEquipo(10L)).thenReturn(2L);
        when(equipos.save(any(Equipo.class))).thenAnswer(call -> call.getArgument(0));

        service.transferirCapitan(10L, 1L, 2L);

        assertEquals("JUGADOR", capitanActual.getRolEquipo());
        assertEquals("CAPITAN", nuevoCapitan.getRolEquipo());
        assertEquals(2L, equipo.getIdUsuarioResponsable());
        verify(equipos).save(equipo);
    }
}