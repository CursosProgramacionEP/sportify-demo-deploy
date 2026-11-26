package com.sportify.backend.service;

import java.text.Normalizer;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.sportify.backend.dto.BloqueHorarioDTO;
import com.sportify.backend.dto.DisponibilidadDTO;
import com.sportify.backend.dto.HorarioDTO;
import com.sportify.backend.model.HorarioComplejo;
import com.sportify.backend.repository.CanchaRepository;
import com.sportify.backend.repository.ComplejoRepository;
import com.sportify.backend.repository.HorarioComplejoRepository;

@Service
public class HorarioService implements ConsultaHorarios, GestionHorarios {

    private static final Set<String> DIAS_VALIDOS = Set.of(
            "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO");

    private final HorarioComplejoRepository horarioRepository;
    private final ComplejoRepository complejoRepository;
    private final CanchaRepository canchaRepository;

    public HorarioService(HorarioComplejoRepository horarioRepository,
            ComplejoRepository complejoRepository,
            CanchaRepository canchaRepository) {
        this.horarioRepository = horarioRepository;
        this.complejoRepository = complejoRepository;
        this.canchaRepository = canchaRepository;
    }

    // get horarios
    @Override
    @Transactional(readOnly = true)
    public List<HorarioDTO> listarHorarios(Long idComplejo) {
        validarComplejo(idComplejo);
        return horarioRepository.findByIdComplejo(idComplejo).stream()
                .sorted((a, b) -> Integer.compare(indiceDia(a.getDiaSemana()), indiceDia(b.getDiaSemana())))
                .map(h -> new HorarioDTO(h.getDiaSemana(), h.getHoraApertura(), h.getHoraCierre()))
                .toList();
    }

    // put horarios
    @Override
    @Transactional
    public List<HorarioDTO> guardarHorarios(Long idComplejo, List<HorarioDTO> horarios) {
        validarComplejo(idComplejo);

        if (horarios == null || horarios.isEmpty()) {
            throw error(HttpStatus.BAD_REQUEST, "Debe enviar al menos un horario.");
        }

        Set<String> diasVistos = new HashSet<>();
        List<HorarioComplejo> nuevos = new ArrayList<>();

        for (HorarioDTO dto : horarios) {
            String dia = normalizarDia(dto.diaSemana());

            // Validar dias
            if (!DIAS_VALIDOS.contains(dia)) {
                throw error(HttpStatus.BAD_REQUEST,
                        "Día inválido: '" + dto.diaSemana()
                                + "'. Use LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO o DOMINGO.");
            }
            // Evitar duplicados dentro de la solicitud
            if (!diasVistos.add(dia)) {
                throw error(HttpStatus.CONFLICT, "El día " + dia + " está repetido. Solo un registro por día.");
            }
            // Validar horas
            if (dto.horaApertura() == null || dto.horaCierre() == null) {
                throw error(HttpStatus.BAD_REQUEST, "Las horas de apertura y cierre son obligatorias (" + dia + ").");
            }
            if (!dto.horaApertura().isBefore(dto.horaCierre())) {
                throw error(HttpStatus.BAD_REQUEST,
                        "hora_apertura debe ser menor a hora_cierre (" + dia + ").");
            }

            HorarioComplejo h = new HorarioComplejo();
            h.setIdComplejo(idComplejo);
            h.setDiaSemana(dia);
            h.setHoraApertura(dto.horaApertura());
            h.setHoraCierre(dto.horaCierre());
            nuevos.add(h);
        }

        // se borra lo anterior y se inserta lo nuevo
        horarioRepository.deleteByIdComplejo(idComplejo);
        horarioRepository.flush();
        horarioRepository.saveAll(nuevos);

        return listarHorarios(idComplejo);
    }

    // horario de un día concreto (lo usa la disponibilidad de las canchas)
    @Override
    @Transactional(readOnly = true)
    public Optional<HorarioDTO> obtenerHorarioDia(Long idComplejo, DayOfWeek dia) {
        return horarioRepository.findByIdComplejoAndDiaSemana(idComplejo, nombreDia(dia))
                .map(h -> new HorarioDTO(h.getDiaSemana(), h.getHoraApertura(), h.getHoraCierre()));
    }

    // disponibilidad
    @Transactional(readOnly = true)
    public DisponibilidadDTO calcularDisponibilidad(Long idComplejo, Long idCancha, LocalDate fecha) {
        validarComplejo(idComplejo);
        if (!canchaRepository.existsById(idCancha)) {
            throw error(HttpStatus.NOT_FOUND, "La cancha " + idCancha + " no existe.");
        }

        String dia = nombreDia(fecha.getDayOfWeek());
        HorarioComplejo horario = horarioRepository
                .findByIdComplejoAndDiaSemana(idComplejo, dia).orElse(null);

        // Si el complejo no abre ese día, no hay bloques
        if (horario == null) {
            return new DisponibilidadDTO(idComplejo, idCancha, fecha, dia, false, List.of());
        }

        List<BloqueHorarioDTO> bloques = new ArrayList<>();
        LocalTime inicio = horario.getHoraApertura();
        LocalTime cierre = horario.getHoraCierre();

        // bloques de 1 hora
        while (true) {
            LocalTime fin = inicio.plusHours(1);
            if (fin.isBefore(inicio) || fin.isAfter(cierre))
                break; // evita desborde pasada la medianoche
            bloques.add(new BloqueHorarioDTO(inicio, fin));
            inicio = fin;
        }

        // TODO: cuando exista la entidad de reservas, restar aquí los bloques ya
        // ocupados de esa cancha y fecha.
        return new DisponibilidadDTO(idComplejo, idCancha, fecha, dia, true, bloques);
    }

    // utilidades
    private void validarComplejo(Long idComplejo) {
        if (!complejoRepository.existsById(idComplejo)) {
            throw error(HttpStatus.NOT_FOUND, "El complejo " + idComplejo + " no existe.");
        }
    }

    private String normalizarDia(String dia) {
        if (dia == null)
            return "";
        String sinTildes = Normalizer.normalize(dia.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return sinTildes.toUpperCase();
    }

    private String nombreDia(DayOfWeek d) {
        return switch (d) {
            case MONDAY -> "LUNES";
            case TUESDAY -> "MARTES";
            case WEDNESDAY -> "MIERCOLES";
            case THURSDAY -> "JUEVES";
            case FRIDAY -> "VIERNES";
            case SATURDAY -> "SABADO";
            case SUNDAY -> "DOMINGO";
        };
    }

    private int indiceDia(String dia) {
        return List.of("LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO").indexOf(dia);
    }

    private ResponseStatusException error(HttpStatus status, String mensaje) {
        return new ResponseStatusException(status, mensaje);
    }
}
