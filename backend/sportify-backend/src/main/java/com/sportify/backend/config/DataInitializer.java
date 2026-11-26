package com.sportify.backend.config;

import com.sportify.backend.model.Rol;
import com.sportify.backend.repository.RolRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/** Asegura que los roles base estén disponibles al iniciar la aplicación. */
@Component
public class DataInitializer implements CommandLineRunner {

    private final RolRepository rolRepository;

    /**
     * Crea el inicializador de los roles base.
     * @param rolRepository repositorio usado para consultar y guardar roles
     */
    public DataInitializer(RolRepository rolRepository) {
        this.rolRepository = rolRepository;
    }

    /**
     * Inserta los roles base que aún no existen.
     * @param args argumentos de inicio, no utilizados
     */
    @Override
    public void run(String... args) {

        List<String> roles = List.of(
            "CLIENTE",
            "ADMIN_PLATAFORMA",
            "ADMIN_COMPLEJO"
        );

        for (String nombre : roles) {
            if (rolRepository.findByNombre(nombre).isEmpty()) {
                Rol rol = new Rol();
                rol.setNombre(nombre);
                rolRepository.save(rol);

                System.out.println("Rol creado: " + nombre);
            } else {
                System.out.println("El rol ya existe: " + nombre);
            }
        }
    }
}
