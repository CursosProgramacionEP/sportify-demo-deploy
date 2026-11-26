package com.sportify.backend.service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.sportify.backend.model.Auditoria;
import com.sportify.backend.model.Complejo;
import com.sportify.backend.repository.AuditoriaRepository;
import com.sportify.backend.repository.ComplejoRepository;

/**
 * Coordina la consulta y actualización de complejos deportivos mediante persistencia JPA.
 *
 * @author Equipo Sportify
 */
@Service
public class ComplejoService {

    private final ComplejoRepository complejoRepository;
    private final AuditoriaRepository auditoriaRepository;

    /**
     * Recibe las dependencias que utiliza esta capa para ejecutar sus operaciones.
     *
     * @param complejoRepository repositorio de complejos deportivos
     * @param auditoriaRepository repositorio para guardar el historial de acciones
     */
    public ComplejoService(ComplejoRepository complejoRepository, AuditoriaRepository auditoriaRepository){
        this.complejoRepository = complejoRepository;
        this.auditoriaRepository = auditoriaRepository; // <-- FALTABA ESTO
    }

    /**
     * Consulta todos los complejos sin paginación.
     * @return lista de complejos persistidos, vacía si no hay registros
     */
    public List<Complejo> listarComplejos(){
        return complejoRepository.findAll();
    }

    /**
     * Busca un complejo por su identificador.
     * @param id identificador del complejo
     * @return complejo encontrado o vacío
     */
    public Optional<Complejo> buscarPorId(Long id){
        return complejoRepository.findById(id);
    }

    /**
     * Busca un complejo por coincidencia exacta de nombre.
     * @param nombre nombre exacto buscado
     * @return complejo encontrado o vacío
     */
    public Optional<Complejo> buscarPorNombre(String nombre){
        return complejoRepository.findByNombre(nombre);
    }

    /**
     * Persiste un complejo nuevo y registra su creación en auditoría.
     * @param complejo datos del complejo
     * @return entidad guardada
     */
    public Complejo registrarComplejo(Complejo complejo){
        Complejo guardado = complejoRepository.save(complejo);
        auditoriaRepository.save(new Auditoria("CREAR_COMPLEJO", "Se registró el complejo " + guardado.getNombre()));
        return guardado;
    }

    /**
     * Sustituye los campos editables de un complejo y registra el tipo de cambio.
     * @param id identificador del complejo
     * @param datos valores que sustituyen sus campos editables
     * @return entidad guardada, o {@code null} si no existe
     */
    public Complejo modificarComplejo(Long id, Complejo datos){
        Optional<Complejo> resultado = complejoRepository.findById(id);
        if (resultado.isEmpty()) {
            return null;
        }
        Complejo complejo = resultado.get();
        
        // Guardamos el estado anterior para saber si cambió
        String estadoAnterior = complejo.getEstado();

        complejo.setNombre(datos.getNombre());
        complejo.setDireccion(datos.getDireccion());
        complejo.setTelefono(datos.getTelefono());
        complejo.setEstado(datos.getEstado());

        Complejo guardado = complejoRepository.save(complejo);

        // Si el estado cambió, lo registramos en la auditoría
        if (!Objects.equals(estadoAnterior, guardado.getEstado())) {
            String accion = "ACTIVO".equalsIgnoreCase(guardado.getEstado()) ? "ACTIVAR_COMPLEJO" : "DESACTIVAR_COMPLEJO";
            auditoriaRepository.save(new Auditoria(accion, "Complejo " + guardado.getNombre()));
        } else {
            auditoriaRepository.save(new Auditoria("EDITAR_COMPLEJO", "Se actualizaron los datos del complejo " + guardado.getNombre()));
        }

        return guardado;
    }

    /**
     * Cambia el estado del complejo y registra la acción en auditoría.
     * @param id identificador del complejo
     * @param estado nuevo valor; el servicio no valida un catálogo de estados
     * @return entidad guardada, o {@code null} si no existe
     */
    public Complejo cambiarEstado(Long id, String estado){
        Optional<Complejo> resultado = complejoRepository.findById(id);
        if (resultado.isEmpty()) {
            return null;
        }
        Complejo complejo = resultado.get();
        complejo.setEstado(estado);
        
        Complejo guardado = complejoRepository.save(complejo); // <-- FALTABA GUARDAR
        
        String accion = "ACTIVO".equalsIgnoreCase(estado) ? "ACTIVAR_COMPLEJO" : "DESACTIVAR_COMPLEJO";
        auditoriaRepository.save(new Auditoria(accion, "Complejo " + guardado.getNombre())); // <-- FALTABA AUDITORÍA
        
        return guardado;
    }
}
