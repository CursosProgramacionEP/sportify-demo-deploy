package com;

import com.sportify.backend.dto.HorarioDTO;
import com.sportify.backend.model.HorarioComplejo;
import com.sportify.backend.repository.CanchaRepository;
import com.sportify.backend.repository.ComplejoRepository;
import com.sportify.backend.repository.HorarioComplejoRepository;
import com.sportify.backend.service.HorarioService;
import org.junit.jupiter.api.Test;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class HorarioServiceTests {

    final HorarioComplejoRepository horarios = mock(HorarioComplejoRepository.class);
    final HorarioService service = new HorarioService(
            horarios, mock(ComplejoRepository.class), mock(CanchaRepository.class));

    @Test
    void obtenerHorarioDiaTraduceElDiaYDevuelveElHorarioGuardado() {
        HorarioComplejo guardado = new HorarioComplejo();
        guardado.setIdComplejo(1L);
        guardado.setDiaSemana("LUNES");
        guardado.setHoraApertura(LocalTime.of(8, 0));
        guardado.setHoraCierre(LocalTime.of(22, 0));
        when(horarios.findByIdComplejoAndDiaSemana(1L, "LUNES")).thenReturn(Optional.of(guardado));

        Optional<HorarioDTO> resultado = service.obtenerHorarioDia(1L, DayOfWeek.MONDAY);

        assertTrue(resultado.isPresent());
        assertEquals(LocalTime.of(8, 0), resultado.get().horaApertura());
        assertEquals(LocalTime.of(22, 0), resultado.get().horaCierre());
    }

    @Test
    void obtenerHorarioDiaVacioSiElComplejoNoAbreEseDia() {
        when(horarios.findByIdComplejoAndDiaSemana(1L, "DOMINGO")).thenReturn(Optional.empty());

        assertTrue(service.obtenerHorarioDia(1L, DayOfWeek.SUNDAY).isEmpty());
    }
}