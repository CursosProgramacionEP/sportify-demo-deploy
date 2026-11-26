package com.sportify.backend;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import com.sportify.backend.dto.HorarioDTO;
import com.sportify.backend.dto.ReservaDatos;
import com.sportify.backend.dto.ReservaResumen;
import com.sportify.backend.model.Cancha;
import com.sportify.backend.model.Reserva;
import com.sportify.backend.repository.AdministradorComplejoRepository;
import com.sportify.backend.repository.AuditoriaRepository;
import com.sportify.backend.repository.CanchaRepository;
import com.sportify.backend.repository.ReservaRepository;
import com.sportify.backend.service.ConsultaHorarios;
import com.sportify.backend.service.ReservaService;

class ReservaServiceTests {

    final ReservaRepository reservas = mock(ReservaRepository.class);
    final CanchaRepository canchas = mock(CanchaRepository.class);
    final ConsultaHorarios horarios = mock(ConsultaHorarios.class);
    final AdministradorComplejoRepository admins = mock(AdministradorComplejoRepository.class);
    final ReservaService service = new ReservaService(
            reservas, canchas, horarios, admins, mock(AuditoriaRepository.class));

    // 7 de enero de 2030 es lunes y siempre está en el futuro.
    static final LocalDate LUNES = LocalDate.of(2030, 1, 7);

    void canchaActivaConHorario8a22() {
        Cancha c = new Cancha(7L, "Cancha 1", new BigDecimal("50.00"), 10, "ACTIVA");
        c.setIdCancha(10L);
        when(canchas.buscarParaReservar(10L)).thenReturn(Optional.of(c));
        when(canchas.findById(10L)).thenReturn(Optional.of(c));
        when(canchas.findAllById(any())).thenReturn(List.of(c));
        when(horarios.obtenerHorarioDia(7L, DayOfWeek.MONDAY)).thenReturn(Optional.of(
                new HorarioDTO("LUNES", LocalTime.of(8, 0), LocalTime.of(22, 0))));
        when(reservas.save(any(Reserva.class))).thenAnswer(i -> i.getArgument(0));
    }

    ReservaDatos.Creacion franja(int hora) {
        return new ReservaDatos.Creacion(10L, LUNES, LocalTime.of(hora, 0), LocalTime.of(hora + 1, 0));
    }

    Reserva reservaDe(Long idUsuario) {
        return new Reserva(10L, idUsuario, LUNES, LocalTime.of(9, 0), LocalTime.of(10, 0));
    }

    @Test
    void creaReservaPendienteSiLaFranjaEstaLibre() {
        canchaActivaConHorario8a22();
        when(reservas.contarConflictos(any(), any(), any(), any(), any())).thenReturn(0L);

        ReservaResumen r = service.crear(5L, franja(9));

        assertEquals("PENDIENTE", r.estado());
        assertEquals(5L, r.idUsuario());
    }

    @Test
    void franjaOcupadaDevuelve409() {
        canchaActivaConHorario8a22();
        when(reservas.contarConflictos(any(), any(), any(), any(), any())).thenReturn(1L);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.crear(5L, franja(9)));
        assertEquals(409, ex.getStatusCode().value());
    }

    @Test
    void franjaFueraDelHorarioDevuelve409() {
        canchaActivaConHorario8a22();

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.crear(5L, franja(6)));
        assertEquals(409, ex.getStatusCode().value());
    }

    @Test
    void soloElDuenoPuedeModificar() {
        canchaActivaConHorario8a22();
        when(reservas.findById(1L)).thenReturn(Optional.of(reservaDe(5L)));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.modificar(1L, 99L,
                        new ReservaDatos.Modificacion(LUNES, LocalTime.of(10, 0), LocalTime.of(11, 0))));
        assertEquals(403, ex.getStatusCode().value());
    }

    @Test
    void elDuenoPuedeCancelar() {
        canchaActivaConHorario8a22();
        when(reservas.findById(1L)).thenReturn(Optional.of(reservaDe(5L)));

        ReservaResumen r = service.cancelar(1L, 5L, false);

        assertEquals("CANCELADA", r.estado());
    }

    @Test
    void otroClienteNoPuedeConfirmar() {
        canchaActivaConHorario8a22();
        when(reservas.findById(1L)).thenReturn(Optional.of(reservaDe(5L)));
        when(admins.existsByIdUsuarioAndIdComplejo(99L, 7L)).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.confirmar(1L, 99L, false));
        assertEquals(403, ex.getStatusCode().value());
    }
}