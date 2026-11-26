package com.sportify.backend.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.sportify.backend.dto.PartidoDatos;
import com.sportify.backend.dto.PartidoResumen;
import com.sportify.backend.service.PartidoService;
import jakarta.validation.Valid;

/**
 * Expone el historial de partidos del equipo: consulta para miembros y
 * modificación para el capitán, siempre que el equipo esté activo.
 *
 * @author Equipo Sportify
 */
@RestController
@RequestMapping("/api/equipos/{idEquipo}/partidos")
public class PartidoController {
    private final PartidoService partidos;

    public PartidoController(PartidoService partidos) {
        this.partidos = partidos;
    }

    /**
     * Lista el historial por fecha descendente. Cualquier miembro.
     *
     * @param idEquipo identificador del equipo
     * @param authentication identidad del solicitante
     * @return partidos con resultado calculado
     */
    @GetMapping
    public List<PartidoResumen> listar(@PathVariable Long idEquipo, Authentication authentication) {
        return partidos.listar(idEquipo, (Long) authentication.getPrincipal());
    }

    /**
     * Registra un partido. Solo el capitán.
     *
     * @param idEquipo identificador del equipo
     * @param datos datos validados del partido
     * @param authentication identidad del solicitante
     * @return partido registrado
     */
    @PostMapping
    public PartidoResumen registrar(@PathVariable Long idEquipo,
            @Valid @RequestBody PartidoDatos.Registro datos,
            Authentication authentication) {
        return partidos.registrar(idEquipo, (Long) authentication.getPrincipal(), datos);
    }

    /**
     * Edita un partido. Solo el capitán.
     *
     * @param idEquipo identificador del equipo
     * @param idPartido identificador del partido
     * @param datos datos validados del partido
     * @param authentication identidad del solicitante
     * @return partido actualizado
     */
    @PutMapping("/{idPartido}")
    public PartidoResumen editar(@PathVariable Long idEquipo, @PathVariable Long idPartido,
            @Valid @RequestBody PartidoDatos.Edicion datos, Authentication authentication) {
        return partidos.editar(idEquipo, idPartido, (Long) authentication.getPrincipal(), datos);
    }

    /**
     * Elimina un partido. Solo el capitán.
     *
     * @param idEquipo identificador del equipo
     * @param idPartido identificador del partido
     * @param authentication identidad del solicitante
     * @return 204 sin cuerpo
     */
    @DeleteMapping("/{idPartido}")
    public ResponseEntity<Void> eliminar(@PathVariable Long idEquipo, @PathVariable Long idPartido,
            Authentication authentication) {
        partidos.eliminar(idEquipo, idPartido, (Long) authentication.getPrincipal());
        return ResponseEntity.noContent().build();
    }
}
