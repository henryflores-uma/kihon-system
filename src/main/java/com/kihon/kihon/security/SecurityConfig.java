package com.kihon.kihon.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http)
                        throws Exception {

                AuthenticationEntryPoint authenticationEntryPoint = (request, response, exception) -> {
                        response.setStatus(
                                        HttpStatus.UNAUTHORIZED.value());
                };

                http
                                .csrf(csrf -> csrf.disable())

                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(
                                                                SessionCreationPolicy.STATELESS))

                                .authorizeHttpRequests(auth -> auth

                                                // =========================
                                                // PÁGINAS PÚBLICAS
                                                // =========================
                                                .requestMatchers(
                                                                "/",
                                                                "/login",
                                                                "/dashboard",
                                                                "/estudiantes",
                                                                "/grupos",
                                                                "/asistencias",
                                                                "/reportes",
                                                                "/registro",
                                                                "/css/**",
                                                                "/js/**",
                                                                "/img/**")
                                                .permitAll()

                                                // =========================
                                                // REGISTRO PÚBLICO
                                                // =========================
                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/api/usuarios")
                                                .permitAll()

                                                // =========================
                                                // CREAR CUENTA PARA ESTUDIANTE
                                                // ADMIN / SECRETARIA
                                                // =========================
                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/api/usuarios/estudiante")
                                                .hasAnyRole("ADMIN", "SECRETARIA")

                                                // =========================
                                                // LISTADO DE USUARIOS
                                                // SOLO ADMIN
                                                // =========================
                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/usuarios")
                                                .hasRole("ADMIN")

                                                // =========================
                                                // GESTIÓN DE USUARIOS
                                                // SOLO ADMIN
                                                // =========================
                                                .requestMatchers(
                                                                "/api/usuarios/*",
                                                                "/api/usuarios/*/estado",
                                                                "/api/usuarios/*/estudiante/*",
                                                                "/api/usuarios/*/rol")
                                                .hasRole("ADMIN")

                                                // =========================
                                                // ACCESO ESPECÍFICO POR ROL
                                                // =========================
                                                .requestMatchers("/api/admin")
                                                .hasRole("ADMIN")

                                                .requestMatchers("/api/secretaria")
                                                .hasRole("SECRETARIA")

                                                .requestMatchers("/api/sensei")
                                                .hasRole("SENSEI")

                                                .requestMatchers("/api/estudiante")
                                                .hasRole("ESTUDIANTE")

                                                // =========================
                                                // GESTIÓN DE ESTUDIANTES
                                                // =========================
                                                .requestMatchers("/api/estudiantes/**")
                                                .hasAnyRole(
                                                                "ADMIN",
                                                                "SECRETARIA")

                                                // =========================
                                                // GESTIÓN DE GRUPOS
                                                // =========================
                                                .requestMatchers("/api/grupos/**")
                                                .hasAnyRole(
                                                                "ADMIN",
                                                                "SECRETARIA")

                                                // =========================
                                                // ASIGNACIÓN DE ESTUDIANTES
                                                // =========================
                                                .requestMatchers(
                                                                "/api/estudiantes-grupos/**")
                                                .hasAnyRole(
                                                                "ADMIN",
                                                                "SECRETARIA")

                                                // =========================
                                                // ASISTENCIAS
                                                // =========================
                                                .requestMatchers(
                                                                "/api/asistencias/**")
                                                .hasAnyRole(
                                                                "ADMIN",
                                                                "SECRETARIA",
                                                                "SENSEI")

                                                // =========================
                                                // REPORTES
                                                // =========================
                                                .requestMatchers(
                                                                "/api/reportes/asistencias/**")
                                                .hasAnyRole(
                                                                "ADMIN",
                                                                "SECRETARIA",
                                                                "SENSEI")

                                                // =========================
                                                // PORTAL DEL ESTUDIANTE
                                                // =========================
                                                .requestMatchers(
                                                                "/api/estudiante/**")
                                                .hasRole("ESTUDIANTE")

                                                // =========================
                                                // RESTO DE ENDPOINTS
                                                // =========================
                                                .anyRequest().authenticated())

                                .exceptionHandling(exception -> exception
                                                .authenticationEntryPoint(
                                                                authenticationEntryPoint))

                                .httpBasic(httpBasic -> httpBasic
                                                .authenticationEntryPoint(
                                                                authenticationEntryPoint));

                return http.build();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }
}