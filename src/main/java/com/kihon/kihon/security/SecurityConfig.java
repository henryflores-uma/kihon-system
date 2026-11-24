package com.kihon.kihon.security;

import tools.jackson.databind.ObjectMapper;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

import java.util.Map;

@Configuration
public class SecurityConfig {

        // =============================================================
        // PASSWORD ENCODER
        // =============================================================

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        // =============================================================
        // AUTENTICACIÓN CON USUARIOS DE LA BASE DE DATOS
        // =============================================================

        @Bean
        public AuthenticationProvider authenticationProvider(
                        CustomUserDetailsService userDetailsService,
                        PasswordEncoder passwordEncoder) {

                DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);

                provider.setPasswordEncoder(passwordEncoder);

                return provider;
        }

        // =============================================================
        // CONFIGURACIÓN PRINCIPAL DE SEGURIDAD
        // =============================================================

        @Bean
        public SecurityFilterChain securityFilterChain(
                        HttpSecurity http,
                        ObjectMapper objectMapper,
                        AuthenticationProvider authenticationProvider) throws Exception {

                // =====================================================
                // REPOSITORIO CSRF
                // =====================================================

                HttpSessionCsrfTokenRepository csrfTokenRepository = new HttpSessionCsrfTokenRepository();

                CsrfTokenRequestAttributeHandler csrfRequestHandler = new CsrfTokenRequestAttributeHandler();

                // =====================================================
                // RESPUESTA PARA SOLICITUDES API NO AUTENTICADAS
                // =====================================================

                var apiAuthenticationEntryPoint = (org.springframework.security.web.AuthenticationEntryPoint) (request,
                                response, exception) -> {

                        response.setStatus(HttpStatus.UNAUTHORIZED.value());
                        response.setContentType("application/json");
                        response.setCharacterEncoding("UTF-8");

                        objectMapper.writeValue(
                                        response.getWriter(),
                                        Map.of("mensaje", "No estás autenticado."));
                };

                // =====================================================
                // CONFIGURACIÓN PRINCIPAL
                // =====================================================

                http

                                // =========================================
                                // PROVEEDOR DE AUTENTICACIÓN
                                // =========================================

                                .authenticationProvider(authenticationProvider)

                                // =========================================
                                // CSRF
                                // =========================================

                                .csrf(csrf -> csrf
                                                .csrfTokenRepository(csrfTokenRepository)
                                                .csrfTokenRequestHandler(csrfRequestHandler))

                                // =========================================
                                // SESIONES HTTP
                                // =========================================

                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                                                .sessionFixation(fixation -> fixation.migrateSession()))

                                // =========================================
                                // AUTORIZACIÓN
                                // =========================================

                                .authorizeHttpRequests(auth -> auth

                                                // Recursos públicos
                                                .requestMatchers(
                                                                "/",
                                                                "/login",
                                                                "/registro",
                                                                "/css/**",
                                                                "/js/**",
                                                                "/img/**",
                                                                "/favicon.ico")
                                                .permitAll()

                                                // CSRF
                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/auth/csrf")
                                                .permitAll()

                                                // Inicio de sesión
                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/api/auth/login")
                                                .permitAll()

                                                // Registro público
                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/api/usuarios")
                                                .permitAll()

                                                // Vistas administrativas
                                                .requestMatchers(
                                                                "/admin/usuarios",
                                                                "/admin/usuarios/**")
                                                .hasRole("ADMIN")

                                                .requestMatchers("/admin/**")
                                                .hasAnyRole("ADMIN", "SECRETARIA")

                                                // Vistas de secretaría
                                                .requestMatchers("/secretaria/**")
                                                .hasAnyRole("ADMIN", "SECRETARIA")

                                                // Vistas del Sensei
                                                .requestMatchers("/sensei/**")
                                                .hasAnyRole("ADMIN", "SENSEI")

                                                // Vistas del estudiante
                                                .requestMatchers("/estudiante/**")
                                                .hasAnyRole("ADMIN", "ESTUDIANTE")

                                                // Cuentas de estudiantes
                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/api/usuarios/estudiante")
                                                .hasAnyRole("ADMIN", "SECRETARIA")

                                                // Usuario actual
                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/usuarios/me")
                                                .authenticated()

                                                // Consulta de Senseis
                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/usuarios/senseis")
                                                .hasAnyRole("ADMIN", "SECRETARIA")

                                                // Módulo de usuarios
                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/usuarios")
                                                .hasRole("ADMIN")

                                                .requestMatchers(
                                                                "/api/usuarios/*",
                                                                "/api/usuarios/*/estado",
                                                                "/api/usuarios/*/rol")
                                                .hasRole("ADMIN")

                                                // Autenticación y perfil
                                                .requestMatchers(
                                                                "/api/auth/me",
                                                                "/api/auth/perfil",
                                                                "/api/auth/perfil/password")
                                                .authenticated()

                                                // Paneles por rol
                                                .requestMatchers("/api/admin")
                                                .hasRole("ADMIN")

                                                .requestMatchers("/api/secretaria")
                                                .hasAnyRole("ADMIN", "SECRETARIA")

                                                .requestMatchers("/api/sensei", "/api/sensei/**")
                                                .hasAnyRole("ADMIN", "SENSEI")

                                                .requestMatchers("/api/estudiante")
                                                .hasAnyRole("ADMIN", "ESTUDIANTE")

                                                // =========================================
                                                // ESTUDIANTES
                                                // =========================================

                                                // Consultar estudiantes
                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/estudiantes",
                                                                "/api/estudiantes/**")
                                                .hasAnyRole("ADMIN", "SECRETARIA", "SENSEI")

                                                // Crear, actualizar y cambiar estado
                                                .requestMatchers(
                                                                "/api/estudiantes",
                                                                "/api/estudiantes/**")
                                                .hasAnyRole("ADMIN", "SECRETARIA")

                                                // Apoderados
                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/api/apoderados/estudiante/*")
                                                .hasAnyRole("ADMIN", "SECRETARIA")

                                                // =========================================
                                                // GRUPOS
                                                // =========================================

                                                // Consulta de grupos
                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/grupos",
                                                                "/api/grupos/**")
                                                .hasAnyRole("ADMIN", "SECRETARIA", "SENSEI")

                                                // Crear, actualizar y eliminar grupos
                                                .requestMatchers(
                                                                "/api/grupos",
                                                                "/api/grupos/**")
                                                .hasAnyRole("ADMIN", "SECRETARIA")

                                                // =========================================
                                                // HORARIOS DE GRUPOS
                                                // =========================================

                                                // Consulta de horarios
                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/grupo-horarios",
                                                                "/api/grupo-horarios/**")
                                                .hasAnyRole("ADMIN", "SECRETARIA", "SENSEI")

                                                // Crear, actualizar y eliminar horarios
                                                .requestMatchers(
                                                                "/api/grupo-horarios",
                                                                "/api/grupo-horarios/**")
                                                .hasAnyRole("ADMIN", "SECRETARIA")

                                                // =========================================
                                                // ESTUDIANTES - GRUPOS
                                                // =========================================

                                                // Consultar asignaciones de estudiantes por grupo
                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/estudiantes-grupos",
                                                                "/api/estudiantes-grupos/**")
                                                .hasAnyRole("ADMIN", "SECRETARIA", "SENSEI")

                                                // Crear, actualizar y eliminar asignaciones
                                                .requestMatchers(
                                                                "/api/estudiantes-grupos",
                                                                "/api/estudiantes-grupos/**")
                                                .hasAnyRole("ADMIN", "SECRETARIA")
                                                // =========================================
                                                // ASISTENCIAS
                                                // =========================================

                                                .requestMatchers("/api/asistencias/**")
                                                .hasAnyRole("ADMIN", "SECRETARIA", "SENSEI")

                                                // Justificaciones
                                                .requestMatchers(
                                                                "/api/justificaciones-asistencia/**",
                                                                "/api/evidencias-asistencia/**")
                                                .hasAnyRole("ADMIN", "SECRETARIA", "SENSEI")

                                                // Motivos de justificación
                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/motivos-justificacion")
                                                .hasAnyRole("ADMIN", "SECRETARIA", "SENSEI")

                                                // Reportes
                                                .requestMatchers("/api/reportes/asistencias/**")
                                                .hasAnyRole("ADMIN", "SECRETARIA", "SENSEI")

                                                // =========================================
                                                // EVENTOS
                                                // =========================================

                                                // Consulta de eventos
                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/eventos",
                                                                "/api/eventos/**")
                                                .hasAnyRole("ADMIN", "SECRETARIA", "SENSEI")

                                                // Crear eventos
                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/api/eventos")
                                                .hasAnyRole("ADMIN", "SECRETARIA")

                                                // Actualizar eventos
                                                .requestMatchers(
                                                                HttpMethod.PUT,
                                                                "/api/eventos/**")
                                                .hasAnyRole("ADMIN", "SECRETARIA")

                                                .requestMatchers(
                                                                HttpMethod.PATCH,
                                                                "/api/eventos/**")
                                                .hasAnyRole("ADMIN", "SECRETARIA")

                                                // Eliminar eventos
                                                .requestMatchers(
                                                                HttpMethod.DELETE,
                                                                "/api/eventos/**")
                                                .hasAnyRole("ADMIN", "SECRETARIA")

                                                // =========================================
                                                // PORTAL DEL ESTUDIANTE
                                                // =========================================

                                                .requestMatchers("/api/estudiante/**")
                                                .hasAnyRole("ADMIN", "ESTUDIANTE")

                                                // Cualquier otra solicitud
                                                .anyRequest().authenticated())

                                // =========================================
                                // FORM LOGIN
                                // =========================================

                                .formLogin(form -> form

                                                .loginPage("/login")

                                                .loginProcessingUrl("/api/auth/login")

                                                .usernameParameter("username")
                                                .passwordParameter("password")

                                                // Login exitoso
                                                .successHandler((request, response, authentication) -> {

                                                        String rol = authentication.getAuthorities()
                                                                        .stream()
                                                                        .map(authority -> authority.getAuthority())
                                                                        .findFirst()
                                                                        .orElse("")
                                                                        .replace("ROLE_", "");

                                                        response.setStatus(HttpStatus.OK.value());
                                                        response.setContentType("application/json");
                                                        response.setCharacterEncoding("UTF-8");

                                                        objectMapper.writeValue(
                                                                        response.getWriter(),
                                                                        Map.of(
                                                                                        "username",
                                                                                        authentication.getName(),
                                                                                        "rol", rol));
                                                })

                                                // Login fallido
                                                .failureHandler((request, response, exception) -> {

                                                        response.setStatus(HttpStatus.UNAUTHORIZED.value());
                                                        response.setContentType("application/json");
                                                        response.setCharacterEncoding("UTF-8");

                                                        objectMapper.writeValue(
                                                                        response.getWriter(),
                                                                        Map.of(
                                                                                        "mensaje",
                                                                                        "Usuario o contraseña incorrectos."));
                                                })

                                                .permitAll())

                                // =========================================
                                // CIERRE DE SESIÓN
                                // =========================================

                                .logout(logout -> logout
                                                .logoutUrl("/api/auth/logout")
                                                .invalidateHttpSession(true)
                                                .clearAuthentication(true)
                                                .deleteCookies("JSESSIONID")
                                                .logoutSuccessHandler(
                                                                (request, response, authentication) -> response
                                                                                .setStatus(
                                                                                                HttpStatus.NO_CONTENT
                                                                                                                .value())))

                                // =========================================
                                // MANEJO DE ERRORES DE AUTENTICACIÓN
                                // =========================================

                                .exceptionHandling(exception -> exception

                                                .defaultAuthenticationEntryPointFor(
                                                                apiAuthenticationEntryPoint,
                                                                request -> request.getServletPath()
                                                                                .startsWith("/api/"))

                                                .authenticationEntryPoint(
                                                                new LoginUrlAuthenticationEntryPoint("/login"))

                                                .accessDeniedHandler(
                                                                (request, response, accessDeniedException) -> {

                                                                        response.setStatus(
                                                                                        HttpStatus.FORBIDDEN.value());
                                                                        response.setContentType("application/json");
                                                                        response.setCharacterEncoding("UTF-8");

                                                                        objectMapper.writeValue(
                                                                                        response.getWriter(),
                                                                                        Map.of(
                                                                                                        "mensaje",
                                                                                                        "No tienes permisos para realizar esta operación."));
                                                                }));

                return http.build();
        }
}
