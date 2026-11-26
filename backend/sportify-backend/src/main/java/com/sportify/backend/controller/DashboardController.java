package com.sportify.backend.controller;

import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

import com.sportify.backend.model.Auditoria;
import com.sportify.backend.repository.AdministradorComplejoRepository;
import com.sportify.backend.repository.AuditoriaRepository;
import com.sportify.backend.repository.ComplejoRepository;
import com.sportify.backend.repository.UsuarioRepository;

/** Expone conteos persistidos y las entradas recientes de auditoría. */
@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    private final ComplejoRepository complejos;
    private final AdministradorComplejoRepository admins;
    private final UsuarioRepository usuarios;
    private final AuditoriaRepository auditorias; 

    /**
     * Crea el controlador con los repositorios usados para calcular métricas y consultar actividad.
     * @param complejos repositorio de complejos
     * @param admins repositorio de asociaciones de administración
     * @param usuarios repositorio de cuentas
     * @param auditorias repositorio del historial de actividad
     */
    public DashboardController(ComplejoRepository complejos, AdministradorComplejoRepository admins, UsuarioRepository usuarios,AuditoriaRepository auditorias) {
        this.complejos = complejos;
        this.admins = admins;
        this.usuarios = usuarios;
        this.auditorias = auditorias; 
    }

    /**
     * Obtiene los conteos actuales de complejos, complejos activos, asociaciones y usuarios.
     * @return conteos de complejos, complejos activos, asociaciones y usuarios
     */
    @GetMapping("/metricas")
    public Map<String, Long> metricas() {
        return Map.of(
            "complejos", complejos.count(),
            "activos",   complejos.countByEstado("ACTIVO"),
            "admins",    admins.count(),
            "usuarios",  usuarios.count()
        );
    }

    /**
     * Consulta las entradas de auditoría más recientes.
     * @return hasta diez entradas ordenadas desde la más reciente
     */
    @GetMapping("/actividad")
    public List<Auditoria> actividad() {
        return auditorias.findTop10ByOrderByFechaDesc();
    }
}
