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
                        response.setStatus(HttpStatus.UNAUTHORIZED.value());
                };

                http
                                .csrf(csrf -> csrf.disable())

                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(
                                                                SessionCreationPolicy.STATELESS))

                                .authorizeHttpRequests(auth -> auth

                                                /*
                                                 * =====================================================
                                                 * RUTAS PÚBLICAS
                                                 * =====================================================
                                                 */

                                                .requestMatchers(
                                                                "/",
                                                                "/login",
                                                                "/registro",
                                                                "/css/**",
                                                                "/js/**",
                                                                "/img/**")
                                                .permitAll()

                                                /*
                                                 * =====================================================
                                                 * VISTAS HTML
                                                 *
                                                 * Las páginas se cargan directamente desde el navegador.
                                                 * La seguridad se aplica a los endpoints /api/**.
                                                 * =====================================================
                                                 */

                                                .requestMatchers(
                                                                "/admin/**",
                                                                "/secretaria/**",
                                                                "/sensei/**",
                                                                "/estudiante/**")
                                                .permitAll()

                                                /*
                                                 * =====================================================
                                                 * REGISTRO DE USUARIOS
                                                 * =====================================================
                                                 */

                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/api/usuarios")
                                                .permitAll()

                                                /*
                                                 * =====================================================
                                                 * CREACIÓN DE CUENTAS DE ESTUDIANTES
                                                 * =====================================================
                                                 */

                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/api/usuarios/estudiante")
                                                .hasAnyRole("ADMIN", "SECRETARIA")

                                                /*
                                                 * =====================================================
                                                 * USUARIOS - CONSULTAS
                                                 * =====================================================
                                                 */

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/usuarios/senseis")
                                                .hasRole("ADMIN")

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/usuarios")
                                                .hasRole("ADMIN")

                                                /*
                                                 * =====================================================
                                                 * USUARIOS - ADMINISTRACIÓN
                                                 * =====================================================
                                                 */

                                                .requestMatchers(
                                                                "/api/usuarios/*",
                                                                "/api/usuarios/*/estado",
                                                                "/api/usuarios/*/rol")
                                                .hasRole("ADMIN")

                                                /*
                                                 * =====================================================
                                                 * AUTENTICACIÓN Y PERFIL
                                                 * =====================================================
                                                 */

                                                .requestMatchers(
                                                                "/api/auth/me",
                                                                "/api/auth/perfil",
                                                                "/api/auth/perfil/password")
                                                .authenticated()

                                                /*
                                                 * =====================================================
                                                 * PANELES POR ROL
                                                 * =====================================================
                                                 */

                                                .requestMatchers(
                                                                "/api/admin")
                                                .hasRole("ADMIN")

                                                .requestMatchers(
                                                                "/api/secretaria")
                                                .hasRole("SECRETARIA")

                                                .requestMatchers(
                                                                "/api/sensei")
                                                .hasRole("SENSEI")

                                                .requestMatchers(
                                                                "/api/estudiante")
                                                .hasRole("ESTUDIANTE")

                                                /*
                                                 * =====================================================
                                                 * ESTUDIANTES
                                                 * =====================================================
                                                 */

                                                .requestMatchers(
                                                                "/api/estudiantes/**")
                                                .hasAnyRole("ADMIN", "SECRETARIA")

                                                /*
                                                 * =====================================================
                                                 * APODERADOS
                                                 * =====================================================
                                                 */

                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/api/apoderados/estudiante/*")
                                                .hasAnyRole("ADMIN", "SECRETARIA")

                                                /*
                                                 * =====================================================
                                                 * GRUPOS
                                                 * =====================================================
                                                 */

                                                .requestMatchers(
                                                                "/api/grupos/**")
                                                .hasAnyRole("ADMIN", "SECRETARIA")

                                                /*
                                                 * =====================================================
                                                 * ESTUDIANTES - GRUPOS
                                                 * =====================================================
                                                 */

                                                .requestMatchers(
                                                                "/api/estudiantes-grupos/**")
                                                .hasAnyRole("ADMIN", "SECRETARIA")

                                                /*
                                                 * =====================================================
                                                 * ASISTENCIAS
                                                 * =====================================================
                                                 */

                                                .requestMatchers(
                                                                "/api/asistencias/**")
                                                .hasAnyRole(
                                                                "ADMIN",
                                                                "SECRETARIA",
                                                                "SENSEI")

                                                /*
                                                 * =====================================================
                                                 * JUSTIFICACIONES DE ASISTENCIA
                                                 * =====================================================
                                                 */

                                                .requestMatchers(
                                                                "/api/justificaciones-asistencia/**")
                                                .hasAnyRole(
                                                                "ADMIN",
                                                                "SECRETARIA",
                                                                "SENSEI")

                                                .requestMatchers(
                                                                "/api/evidencias-asistencia/**")
                                                .hasAnyRole(
                                                                "ADMIN",
                                                                "SECRETARIA",
                                                                "SENSEI")

                                                /*
                                                 * =====================================================
                                                 * MOTIVOS DE JUSTIFICACIÓN
                                                 * Solo lectura
                                                 * =====================================================
                                                 */

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/motivos-justificacion")
                                                .hasAnyRole(
                                                                "ADMIN",
                                                                "SECRETARIA",
                                                                "SENSEI")

                                                /*
                                                 * =====================================================
                                                 * REPORTES DE ASISTENCIA
                                                 * =====================================================
                                                 */

                                                .requestMatchers(
                                                                "/api/reportes/asistencias/**")
                                                .hasAnyRole(
                                                                "ADMIN",
                                                                "SECRETARIA",
                                                                "SENSEI")

                                                /*
                                                 * =====================================================
                                                 * EVENTOS - CONSULTA
                                                 * =====================================================
                                                 */

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/eventos",
                                                                "/api/eventos/**")
                                                .hasAnyRole(
                                                                "ADMIN",
                                                                "SECRETARIA",
                                                                "SENSEI")

                                                /*
                                                 * =====================================================
                                                 * EVENTOS - CREACIÓN
                                                 * =====================================================
                                                 */

                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/api/eventos")
                                                .hasAnyRole(
                                                                "ADMIN",
                                                                "SECRETARIA")

                                                /*
                                                 * =====================================================
                                                 * EVENTOS - ACTUALIZACIÓN
                                                 * =====================================================
                                                 */

                                                .requestMatchers(
                                                                HttpMethod.PUT,
                                                                "/api/eventos/**")
                                                .hasAnyRole(
                                                                "ADMIN",
                                                                "SECRETARIA")

                                                /*
                                                 * =====================================================
                                                 * EVENTOS - CAMBIO DE ESTADO
                                                 * =====================================================
                                                 */

                                                .requestMatchers(
                                                                HttpMethod.PATCH,
                                                                "/api/eventos/**")
                                                .hasAnyRole(
                                                                "ADMIN",
                                                                "SECRETARIA")

                                                /*
                                                 * =====================================================
                                                 * EVENTOS - ELIMINACIÓN
                                                 * =====================================================
                                                 */

                                                .requestMatchers(
                                                                HttpMethod.DELETE,
                                                                "/api/eventos/**")
                                                .hasAnyRole(
                                                                "ADMIN",
                                                                "SECRETARIA")

                                                /*
                                                 * =====================================================
                                                 * RUTAS DEL ESTUDIANTE
                                                 * =====================================================
                                                 */

                                                .requestMatchers(
                                                                "/api/estudiante/**")
                                                .hasRole("ESTUDIANTE")

                                                /*
                                                 * =====================================================
                                                 * CUALQUIER OTRA RUTA
                                                 * =====================================================
                                                 */

                                                .anyRequest().authenticated())

                                /*
                                 * =========================================================
                                 * MANEJO DE AUTENTICACIÓN
                                 * =========================================================
                                 */

                                .exceptionHandling(exception -> exception
                                                .authenticationEntryPoint(
                                                                authenticationEntryPoint))

                                /*
                                 * =========================================================
                                 * HTTP BASIC
                                 * =========================================================
                                 */

                                .httpBasic(httpBasic -> httpBasic
                                                .authenticationEntryPoint(
                                                                authenticationEntryPoint));

                return http.build();
        }

        /*
         * =============================================================
         * PASSWORD ENCODER
         * =============================================================
         */

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }
}