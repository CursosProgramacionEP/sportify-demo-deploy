package com.sportify.backend.controller;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

/** Errores JSON sin exponer consultas SQL ni credenciales al navegador.
 * @author Equipo Sportify
 */
@RestControllerAdvice
public class ApiExceptionHandler {
    /** Crea el manejador sin dependencias de persistencia. */
    public ApiExceptionHandler() { }

    /**
     * Conserva el estado HTTP y el mensaje previsto por la capa de negocio.
     * @param error rechazo controlado
     * @return error JSON con su estado original
     */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<?> negocio(ResponseStatusException error) {
        return ResponseEntity.status(error.getStatusCode())
                .body(Map.of("message", error.getReason() == null ? "Solicitud rechazada." : error.getReason()));
    }

    /**
     * Presenta el primer campo inválido sin incluir el valor recibido.
     * @param error errores de validación del cuerpo
     * @return respuesta 400 con el detalle del campo
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> validacion(MethodArgumentNotValidException error) {
        var detalle = error.getBindingResult().getFieldErrors().stream()
                .map(campo -> campo.getField() + ": " + campo.getDefaultMessage()).findFirst()
                .orElse("Revisa los datos enviados.");
        return ResponseEntity.badRequest().body(Map.of("message", detalle));
    }

    /**
     * Oculta detalles SQL cuando PostgreSQL rechaza una restricción.
     * @param error conflicto de integridad
     * @return respuesta 409 con explicación genérica
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> integridad(DataIntegrityViolationException error) {
        return ResponseEntity.status(409).body(Map.of("message", "Los datos duplican un registro o incumplen una restricción. Revisa la información."));
    }
}
