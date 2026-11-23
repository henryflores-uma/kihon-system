
package com.kihon.kihon.security;

import tools.jackson.databind.ObjectMapper;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
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

        @Bean
        public SecurityFilterChain securityFilterChain(
                        HttpSecurity http,
                        ObjectMapper objectMapper) throws Exception {

                /*
                 * =====================================================
                 * REPOSITORIO CSRF
                 * =====================================================
                 */

                HttpSessionCsrfTokenRepository csrfTokenRepository = new HttpSessionCsrfTokenRepository();

                CsrfTokenRequestAttributeHandler csrfRequestHandler = new CsrfTokenRequestAttributeHandler();

                /*
                 * =====================================================
                 * RESPUESTA PARA SOLICITUDES API NO AUTENTICADAS
                 * =====================================================
                 */

                var apiAuthenticationEntryPoint = (org.springframework.security.web.AuthenticationEntryPoint) (request,
                                response, exception) -> {

                        response.setStatus(HttpStatus.UNAUTHORIZED.value());
                        response.setContentType("application/json");
                        response.setCharacterEncoding("UTF-8");

                        objectMapper.writeValue(
                                        response.getWriter(),
                                        Map.of("mensaje", "No estás autenticado."));
                };

                /*
                 * =====================================================
                 * CONFIGURACIÓN PRINCIPAL
                 * =====================================================
                 */

                http

                                /*
                                 * =================================================
                                 * CSRF
                                 * =================================================
                                 */

                                .csrf(csrf -> csrf
                                                .csrfTokenRepository(csrfTokenRepository)
                                                .csrfTokenRequestHandler(csrfRequestHandler))

                                /*
                                 * =================================================
                                 * SESIONES HTTP
                                 * =================================================
                                 */

                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                                                .sessionFixation(fixation -> fixation.migrateSession()))

                                /*
                                 * =================================================
                                 * AUTORIZACIÓN
                                 * =================================================
                                 */

                                .authorizeHttpRequests(auth -> auth

                                                /*
                                                 * =========================================
                                                 * RECURSOS PÚBLICOS
                                                 * =========================================
                                                 */

                                                .requestMatchers(
                                                                "/",
                                                                "/login",
                                                                "/registro",
                                                                "/css/**",
                                                                "/js/**",
                                                                "/img/**",
                                                                "/favicon.ico")
                                                .permitAll()

                                                /*
                                                 * =========================================
                                                 * CSRF
                                                 * =========================================
                                                 */

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/auth/csrf")
                                                .permitAll()

                                                /*
                                                 * =========================================
                                                 * INICIO DE SESIÓN
                                                 * =========================================
                                                 */

                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/api/auth/login")
                                                .permitAll()

                                                /*
                                                 * =========================================
                                                 * REGISTRO PÚBLICO
                                                 * =========================================
                                                 */

                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/api/usuarios")
                                                .permitAll()

                                                /*
                                                 * =========================================
                                                 * VISTAS ADMINISTRATIVAS
                                                 * =========================================
                                                 */

                                                .requestMatchers(
                                                                "/admin/usuarios",
                                                                "/admin/usuarios/**")
                                                .hasRole("ADMIN")

                                                .requestMatchers(
                                                                "/admin/**")
                                                .hasAnyRole("ADMIN", "SECRETARIA")

                                                /*
                                                 * =========================================
                                                 * VISTAS DE SECRETARÍA
                                                 * =========================================
                                                 */

                                                .requestMatchers(
                                                                "/secretaria/**")
                                                .hasAnyRole("ADMIN", "SECRETARIA")

                                                /*
                                                 * =========================================
                                                 * VISTAS DEL SENSEI
                                                 * =========================================
                                                 */

                                                .requestMatchers(
                                                                "/sensei/**")
                                                .hasAnyRole("ADMIN", "SENSEI")

                                                /*
                                                 * =========================================
                                                 * VISTAS DEL ESTUDIANTE
                                                 * =========================================
                                                 */

                                                .requestMatchers(
                                                                "/estudiante/**")
                                                .hasAnyRole("ADMIN", "ESTUDIANTE")

                                                /*
                                                 * =========================================
                                                 * CUENTAS DE ESTUDIANTES
                                                 * =========================================
                                                 */

                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/api/usuarios/estudiante")
                                                .hasAnyRole("ADMIN", "SECRETARIA")

                                                /*
                                                 * =========================================
                                                 * USUARIO ACTUAL
                                                 * =========================================
                                                 */

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/usuarios/me")
                                                .authenticated()

                                                /*
                                                 * =========================================
                                                 * CONSULTA DE SENSEIS
                                                 * =========================================
                                                 */

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/usuarios/senseis")
                                                .hasAnyRole("ADMIN", "SECRETARIA")

                                                /*
                                                 * =========================================
                                                 * MÓDULO DE USUARIOS
                                                 * =========================================
                                                 */

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/usuarios")
                                                .hasRole("ADMIN")

                                                .requestMatchers(
                                                                "/api/usuarios/*",
                                                                "/api/usuarios/*/estado",
                                                                "/api/usuarios/*/rol")
                                                .hasRole("ADMIN")

                                                /*
                                                 * =========================================
                                                 * AUTENTICACIÓN Y PERFIL
                                                 * =========================================
                                                 */

                                                .requestMatchers(
                                                                "/api/auth/me",
                                                                "/api/auth/perfil",
                                                                "/api/auth/perfil/password")
                                                .authenticated()

                                                /*
                                                 * =========================================
                                                 * PANELES POR ROL
                                                 * =========================================
                                                 */

                                                .requestMatchers("/api/admin")
                                                .hasRole("ADMIN")

                                                .requestMatchers("/api/secretaria")
                                                .hasAnyRole("ADMIN", "SECRETARIA")

                                                .requestMatchers("/api/sensei")
                                                .hasAnyRole("ADMIN", "SENSEI")

                                                .requestMatchers("/api/estudiante")
                                                .hasAnyRole("ADMIN", "ESTUDIANTE")

                                                /*
                                                 * =========================================
                                                 * ESTUDIANTES
                                                 * =========================================
                                                 */

                                                .requestMatchers(
                                                                "/api/estudiantes/**")
                                                .hasAnyRole("ADMIN", "SECRETARIA")

                                                /*
                                                 * =========================================
                                                 * APODERADOS
                                                 * =========================================
                                                 */

                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/api/apoderados/estudiante/*")
                                                .hasAnyRole("ADMIN", "SECRETARIA")

                                                /*
                                                 * =========================================
                                                 * GRUPOS
                                                 * =========================================
                                                 */

                                                .requestMatchers(
                                                                "/api/grupos/**")
                                                .hasAnyRole("ADMIN", "SECRETARIA")

                                                /*
                                                 * =========================================
                                                 * ESTUDIANTES - GRUPOS
                                                 * =========================================
                                                 */

                                                .requestMatchers(
                                                                "/api/estudiantes-grupos/**")
                                                .hasAnyRole("ADMIN", "SECRETARIA")

                                                /*
                                                 * =========================================
                                                 * ASISTENCIAS
                                                 * =========================================
                                                 */

                                                .requestMatchers(
                                                                "/api/asistencias/**")
                                                .hasAnyRole("ADMIN", "SECRETARIA", "SENSEI")

                                                /*
                                                 * =========================================
                                                 * JUSTIFICACIONES
                                                 * =========================================
                                                 */

                                                .requestMatchers(
                                                                "/api/justificaciones-asistencia/**",
                                                                "/api/evidencias-asistencia/**")
                                                .hasAnyRole("ADMIN", "SECRETARIA", "SENSEI")

                                                /*
                                                 * =========================================
                                                 * MOTIVOS DE JUSTIFICACIÓN
                                                 * =========================================
                                                 */

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/motivos-justificacion")
                                                .hasAnyRole("ADMIN", "SECRETARIA", "SENSEI")

                                                /*
                                                 * =========================================
                                                 * REPORTES
                                                 * =========================================
                                                 */

                                                .requestMatchers(
                                                                "/api/reportes/asistencias/**")
                                                .hasAnyRole("ADMIN", "SECRETARIA", "SENSEI")

                                                /*
                                                 * =========================================
                                                 * EVENTOS - CONSULTA
                                                 * =========================================
                                                 */

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/eventos",
                                                                "/api/eventos/**")
                                                .hasAnyRole("ADMIN", "SECRETARIA", "SENSEI")

                                                /*
                                                 * =========================================
                                                 * EVENTOS - MODIFICACIÓN
                                                 * =========================================
                                                 */

                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/api/eventos")
                                                .hasAnyRole("ADMIN", "SECRETARIA")

                                                .requestMatchers(
                                                                HttpMethod.PUT,
                                                                "/api/eventos/**")
                                                .hasAnyRole("ADMIN", "SECRETARIA")

                                                .requestMatchers(
                                                                HttpMethod.PATCH,
                                                                "/api/eventos/**")
                                                .hasAnyRole("ADMIN", "SECRETARIA")

                                                .requestMatchers(
                                                                HttpMethod.DELETE,
                                                                "/api/eventos/**")
                                                .hasAnyRole("ADMIN", "SECRETARIA")

                                                /*
                                                 * =========================================
                                                 * PORTAL DEL ESTUDIANTE
                                                 * =========================================
                                                 */

                                                .requestMatchers(
                                                                "/api/estudiante/**")
                                                .hasAnyRole("ADMIN", "ESTUDIANTE")

                                                /*
                                                 * =========================================
                                                 * CUALQUIER OTRA SOLICITUD
                                                 * =========================================
                                                 */

                                                .anyRequest().authenticated())

                                /*
                                 * =================================================
                                 * FORM LOGIN
                                 * =================================================
                                 */

                                .formLogin(form -> form

                                                // Utilizar el login.html personalizado.
                                                .loginPage("/login")

                                                // Endpoint que procesa las credenciales.
                                                .loginProcessingUrl("/api/auth/login")

                                                .usernameParameter("username")
                                                .passwordParameter("password")

                                                /*
                                                 * =========================================
                                                 * LOGIN EXITOSO
                                                 * =========================================
                                                 */

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

                                                /*
                                                 * =========================================
                                                 * LOGIN FALLIDO
                                                 * =========================================
                                                 */

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

                                /*
                                 * =================================================
                                 * CIERRE DE SESIÓN
                                 * =================================================
                                 */

                                .logout(logout -> logout
                                                .logoutUrl("/api/auth/logout")
                                                .invalidateHttpSession(true)
                                                .clearAuthentication(true)
                                                .deleteCookies("JSESSIONID")
                                                .logoutSuccessHandler(
                                                                (request, response, authentication) -> response
                                                                                .setStatus(HttpStatus.NO_CONTENT
                                                                                                .value())))

                                /*
                                 * =================================================
                                 * MANEJO DE ERRORES DE AUTENTICACIÓN
                                 * =================================================
                                 */

                                .exceptionHandling(exception -> exception

                                                .defaultAuthenticationEntryPointFor(
                                                                apiAuthenticationEntryPoint,
                                                                request -> request.getServletPath().startsWith("/api/"))

                                                .authenticationEntryPoint(
                                                                new LoginUrlAuthenticationEntryPoint("/login"))

                                                .accessDeniedHandler((request, response, accessDeniedException) -> {

                                                        response.setStatus(HttpStatus.FORBIDDEN.value());
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
