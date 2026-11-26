package com.sportify.backend;

import com.sportify.backend.config.SecurityConfig;
import com.sportify.backend.controller.*;
import com.sportify.backend.dto.UsuarioResumen;
import com.sportify.backend.model.Usuario;
import com.sportify.backend.service.*;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringJUnitConfig(SecurityAccessTests.Config.class)
@WebAppConfiguration
class SecurityAccessTests {
    @Configuration
    @EnableWebMvc
    @EnableWebSecurity
    @Import({SecurityConfig.class, UsuarioController.class, AuthController.class, ApiExceptionHandler.class,
        EquipoController.class, EquipoJugadorController.class, PartidoController.class
    })
    static class Config {
        @Bean UsuarioService usuarios() { return mock(UsuarioService.class); }
        @Bean AuthService auth() { return mock(AuthService.class); }
        @Bean EquipoService equipos() { return mock(EquipoService.class); }
        @Bean EquipoJugadorService jugadores() { return mock(EquipoJugadorService.class); }
        @Bean PartidoService partidos() { return mock(PartidoService.class); }
    }

    @Autowired WebApplicationContext context;
    @Autowired UsuarioService usuarios;
    @Autowired AuthService auth;
    @Autowired EquipoService equipos;   
    MockMvc mvc;

    @BeforeEach void setup() {
        reset(usuarios, auth, equipos);
        mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
        when(usuarios.resumen(1L)).thenReturn(cuenta("ACTIVO", "ADMIN_PLATAFORMA"));
        when(usuarios.listar()).thenReturn(List.of(cuenta("ACTIVO", "ADMIN_PLATAFORMA")));
    }

    UsuarioResumen cuenta(String estado, String rol) {
        return new UsuarioResumen(1L, "Ana", "Pérez", "999999999", "ana@example.com", estado, List.of(rol));
    }

    UsernamePasswordAuthenticationToken sesion() {
        return UsernamePasswordAuthenticationToken.authenticated(1L, null,
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN_PLATAFORMA")));
    }

    @Test void anonimoNoLeeUsuarios() throws Exception {
        mvc.perform(get("/api/usuarios")).andExpect(status().isUnauthorized());
        verify(usuarios, never()).listar();
    }

    @Test void administradorLeeSoloResumenSinCredenciales() throws Exception {
        mvc.perform(get("/api/usuarios").with(authentication(sesion())))
            .andExpect(status().isOk()).andExpect(jsonPath("$[0].correo").value("ana@example.com"))
            .andExpect(jsonPath("$[0].password").doesNotExist()).andExpect(jsonPath("$[0].contrasena").doesNotExist());
    }

    @Test void rolRetiradoSeAplicaAunqueLaSesionAntiguaDigaAdministrador() throws Exception {
        when(usuarios.resumen(1L)).thenReturn(cuenta("ACTIVO", "CLIENTE"));
        mvc.perform(get("/api/usuarios").with(authentication(sesion()))).andExpect(status().isForbidden());
        mvc.perform(get("/api/auth/me").with(authentication(sesion()))).andExpect(status().isOk());
        verify(usuarios, never()).listar();
    }

    @Test void cuentaDesactivadaPierdeAcceso() throws Exception {
        when(usuarios.resumen(1L)).thenReturn(cuenta("INACTIVO", "ADMIN_PLATAFORMA"));
        mvc.perform(get("/api/usuarios").with(authentication(sesion()))).andExpect(status().isUnauthorized());
    }

    @Test void escrituraExigeCsrfInclusoAlAdministrador() throws Exception {
        mvc.perform(patch("/api/usuarios/2/estado").with(authentication(sesion()))
                .contentType("application/json").content("{\"estado\":\"INACTIVO\"}"))
            .andExpect(status().isForbidden());
        verify(usuarios, never()).cambiarEstado(any(), any(), any());
    }

    @Test void estadoInvalidoNoLlegaAlServicio() throws Exception {
        mvc.perform(patch("/api/usuarios/2/estado").with(authentication(sesion())).with(csrf())
                .contentType("application/json").content("{\"estado\":\"OTRO\"}"))
            .andExpect(status().isBadRequest());
        verify(usuarios, never()).cambiarEstado(any(), any(), any());
    }

    @Test void loginRotaLaSesionYLogoutLaInvalida() throws Exception {
        Usuario usuario = new Usuario();
        usuario.setIdUsuario(1L);
        when(auth.autenticar("ana@example.com", "Prueba123")).thenReturn(usuario);
        MockHttpSession session = new MockHttpSession();
        String original = session.getId();
        mvc.perform(post("/api/auth/login").session(session).with(csrf())
                .contentType("application/json").content("{\"correo\":\"ana@example.com\",\"contrasena\":\"Prueba123\"}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.roles[0]").value("ADMIN_PLATAFORMA"));
        assertNotEquals(original, session.getId());
        mvc.perform(get("/api/usuarios").session(session)).andExpect(status().isOk());
        mvc.perform(post("/api/auth/logout").session(session).with(csrf())).andExpect(status().isNoContent());
        assertTrue(session.isInvalid());
    }

    @Test void corsSoloAceptaElFrontendConfigurado() throws Exception {
        mvc.perform(options("/api/usuarios").header("Origin", "http://localhost:5173")
                .header("Access-Control-Request-Method", "GET"))
            .andExpect(status().isOk()).andExpect(header().string("Access-Control-Allow-Credentials", "true"));
        mvc.perform(options("/api/usuarios").header("Origin", "https://otro.example")
                .header("Access-Control-Request-Method", "GET")).andExpect(status().isForbidden());
    }

    @Test void tokenEntregadoAlNavegadorPermiteLoginYSeRenueva() throws Exception {
        Usuario usuario = new Usuario();
        usuario.setIdUsuario(1L);
        when(auth.autenticar("ana@example.com", "Prueba123")).thenReturn(usuario);
        var preparada = mvc.perform(get("/api/auth/csrf")).andExpect(status().isOk()).andReturn();
        var session = (MockHttpSession) preparada.getRequest().getSession(false);
        var mapper = new tools.jackson.databind.ObjectMapper();
        var token = mapper.readTree(preparada.getResponse().getContentAsString());
        mvc.perform(post("/api/auth/login").session(session)
                .header(token.get("headerName").asText(), token.get("token").asText())
                .contentType("application/json").content("{\"correo\":\"ana@example.com\",\"contrasena\":\"Prueba123\"}"))
            .andExpect(status().isOk());
        mvc.perform(post("/api/auth/logout").session(session)
                .header(token.get("headerName").asText(), token.get("token").asText()))
            .andExpect(status().isForbidden());
        var renovada = mvc.perform(get("/api/auth/csrf").session(session)).andReturn();
        var nuevo = mapper.readTree(renovada.getResponse().getContentAsString());
        mvc.perform(post("/api/auth/logout").session(session)
                .header(nuevo.get("headerName").asText(), nuevo.get("token").asText()))
            .andExpect(status().isNoContent());
    }

    @Test void anonimoNoAccedeAEquipos() throws Exception {
    mvc.perform(get("/api/equipos/mios")).andExpect(status().isUnauthorized());
    }

    @Test void autenticadoAccedeAEquiposSinRolDePlataforma() throws Exception {
        when(equipos.listarMios(1L)).thenReturn(java.util.List.of());
        mvc.perform(get("/api/equipos/mios").with(authentication(sesion())))
            .andExpect(status().isOk());
    }
}
