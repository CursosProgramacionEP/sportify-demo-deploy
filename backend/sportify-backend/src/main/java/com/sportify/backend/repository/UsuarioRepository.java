package com.sportify.backend.repository;

import com.sportify.backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;


/**
 * Accede a usuarios por identidad y correo mediante consultas derivadas de Spring Data JPA.
 *
 * @author Equipo Sportify
 */
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    /**
     * Localiza una cuenta sin distinguir mayúsculas del correo.
     * @param correo dirección normalizada por el servicio
     * @return cuenta encontrada o vacío
     */
    Optional<Usuario> findByCorreoIgnoreCase(String correo);

    /**
     * Detecta un correo ocupado al editar una cuenta existente.
     * @param correo dirección propuesta
     * @param idUsuario cuenta excluida de la comprobación
     * @return true si otra cuenta utiliza el correo
     */
    boolean existsByCorreoIgnoreCaseAndIdUsuarioNot(String correo, Long idUsuario);

    /**
     * Consulta por coincidencia exacta del correo persistido.
     *
     * @param correo correo que se consulta, sin normalización adicional
     * @return usuario encontrado o Optional vacío
     * @throws org.springframework.dao.DataAccessException si falla el acceso a persistencia
     */
    Optional<Usuario> findByCorreo(String correo);

    /**
     * Comprueba si hay un usuario con el correo indicado.
     *
     * @param correo correo que se consulta, sin normalización adicional
     * @return true cuando existe al menos una coincidencia
     * @throws org.springframework.dao.DataAccessException si falla el acceso a persistencia
     */
    boolean existsByCorreo(String correo);
}
