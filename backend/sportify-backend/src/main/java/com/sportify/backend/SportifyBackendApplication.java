package com.sportify.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** Punto de entrada de la aplicación Spring Boot de Sportify. */
@SpringBootApplication
public class SportifyBackendApplication {

	/** Inicia el contexto de Spring Boot con los argumentos recibidos. */
	public static void main(String[] args) {
		SpringApplication.run(SportifyBackendApplication.class, args);
	}

}
