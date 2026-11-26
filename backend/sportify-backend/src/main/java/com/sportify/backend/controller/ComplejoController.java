package com.sportify.backend.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sportify.backend.model.Complejo;
import com.sportify.backend.service.ComplejoService;

/**
 * Expone consultas y modificaciones HTTP de complejos; traduce ausencias a respuestas 404.
 *
 * @author Equipo Sportify
 */
@RestController
@RequestMapping("api/complejos")
public class ComplejoController {

    private final ComplejoService complejoService;

    /**
     * Recibe el servicio que consulta y modifica los complejos deportivos.
     *
     * @param complejoService servicio de gestión de complejos
     */
    public ComplejoController(ComplejoService complejoService){
        this.complejoService=complejoService;
    }

    /**
     * Entrega el catálogo completo sin paginación ni filtro de estado.
     *
     * @return lista de complejos; vacía cuando no existen registros
     */
    @GetMapping
    public List<Complejo> listarComplejos(){
        return complejoService.listarComplejos();
    }

    /**
     * Traduce la ausencia de un identificador a una respuesta HTTP 404.
     *
     * @param id identificador del complejo
     * @return 200 con el complejo o 404 si no existe
     */
    @GetMapping("/{id}")
    public ResponseEntity<Complejo> buscarPorId(@PathVariable Long id){
        Optional<Complejo> complejo = complejoService.buscarPorId(id);
        if(complejo.isPresent()){
            return ResponseEntity.ok(complejo.get());
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Resuelve una coincidencia exacta de nombre y devuelve 404 cuando no existe.
     *
     * @param nombre nombre exacto que se consulta
     * @return 200 con el complejo o 404 si no existe
     */
    @GetMapping("/nombre/{nombre}")
    public ResponseEntity<Complejo> buscarPorNombre(@PathVariable String nombre){
        Optional<Complejo> complejo =complejoService.buscarPorNombre(nombre);
        if(complejo.isPresent()){
            return ResponseEntity.ok(complejo.get());
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Guarda los datos recibidos y entrega la entidad resultante al cliente.
     *
     * @param complejo entidad que se entrega a persistencia
     * @return 200 con la entidad guardada
     */
    @PostMapping
    public ResponseEntity<Complejo> registrarComplejo(@RequestBody Complejo complejo){
        Complejo nuevoComplejo = complejoService.registrarComplejo(complejo);
        return ResponseEntity.ok(nuevoComplejo);
    }

    /**
     * Sustituye los campos editables del complejo y comunica si el identificador no existe.
     *
     * @param id identificador del complejo
     * @param datos datos recibidos para la operación
     * @return 200 con la entidad modificada o 404 si no existe
     */
    @PutMapping ("/{id}")
    public ResponseEntity<Complejo> modificarComplejo(@PathVariable Long id, @RequestBody Complejo datos){
        Complejo complejo = complejoService.modificarComplejo(id, datos);
        if(complejo==null){
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(complejo);
    }

    /**
     * Devuelve el objeto con el estado solicitado; el servicio no garantiza persistir el cambio.
     *
     * @param id identificador del complejo
     * @param estado nuevo estado, sin validación de catálogo en esta capa
     * @return 200 con el objeto modificado o 404; la respuesta no garantiza persistencia del cambio
     */
    @PatchMapping("/{id}/estado")
    public ResponseEntity<Complejo> cambiarEstado(@PathVariable Long id, @RequestParam String estado) {
        Complejo complejo = complejoService.cambiarEstado(id, estado);
        if (complejo == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(complejo);
    }
}
