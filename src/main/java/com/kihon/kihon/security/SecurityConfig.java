package com.kihon.kihon.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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

                                                // Frontend público
                                                .requestMatchers(
                                                                "/login",
                                                                "/dashboard",
                                                                "/css/**",
                                                                "/js/**",
                                                                "/img/**")
                                                .permitAll()

                                                // Registro público de usuarios
                                                .requestMatchers("/api/usuarios")
                                                .permitAll()

                                                // Acceso específico por rol
                                                .requestMatchers("/api/admin")
                                                .hasRole("ADMIN")

                                                .requestMatchers("/api/secretaria")
                                                .hasRole("SECRETARIA")

                                                .requestMatchers("/api/sensei")
                                                .hasRole("SENSEI")

                                                .requestMatchers("/api/estudiante")
                                                .hasRole("ESTUDIANTE")

                                                // Gestión de estudiantes
                                                .requestMatchers("/api/estudiantes/**")
                                                .hasAnyRole("ADMIN", "SECRETARIA")

                                                // Gestión de grupos
                                                .requestMatchers("/api/grupos/**")
                                                .hasAnyRole("ADMIN", "SECRETARIA")

                                                // Asignación de estudiantes a grupos
                                                .requestMatchers("/api/estudiantes-grupos/**")
                                                .hasAnyRole("ADMIN", "SECRETARIA")

                                                // Registro y consulta de asistencias
                                                .requestMatchers("/api/asistencias/**")
                                                .hasAnyRole(
                                                                "ADMIN",
                                                                "SECRETARIA",
                                                                "SENSEI")

                                                // Reportes de asistencia
                                                .requestMatchers(
                                                                "/api/reportes/asistencias/**")
                                                .hasAnyRole(
                                                                "ADMIN",
                                                                "SECRETARIA",
                                                                "SENSEI")

                                                // Portal del estudiante
                                                .requestMatchers("/api/estudiante/**")
                                                .hasRole("ESTUDIANTE")

                                                // Resto de endpoints
                                                .anyRequest().authenticated())

                                .exceptionHandling(exception -> exception
                                                .authenticationEntryPoint(
                                                                authenticationEntryPoint))

                                // HTTP Basic sin ventana emergente
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