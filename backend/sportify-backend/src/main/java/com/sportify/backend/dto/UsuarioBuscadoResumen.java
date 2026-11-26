package com.sportify.backend.dto;
/**
 * Vista mínima de un usuario localizado por correo exacto. Se usa para que el
 * capitán pueda agregar a un jugador conociendo solo su correo.
 *
 * @param idUsuario identificador del usuario encontrado
 * @param nombres nombres del usuario
 * @param apellidos apellidos del usuario
 * @param correo correo de la cuenta
 * @author Equipo Sportify
 */
public record UsuarioBuscadoResumen(
        Long idUsuario, String nombres, String apellidos, String correo) { }
