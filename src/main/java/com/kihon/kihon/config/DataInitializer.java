package com.kihon.kihon.config;

import com.kihon.kihon.model.Persona;
import com.kihon.kihon.model.Rol;
import com.kihon.kihon.model.TipoDocumento;
import com.kihon.kihon.model.Usuario;
import com.kihon.kihon.repository.PersonaRepository;
import com.kihon.kihon.repository.RolRepository;
import com.kihon.kihon.repository.TipoDocumentoRepository;
import com.kihon.kihon.repository.UsuarioRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Configuration
public class DataInitializer {

        @Bean
        CommandLineRunner inicializarDatos(
                        RolRepository rolRepository,
                        UsuarioRepository usuarioRepository,
                        TipoDocumentoRepository tipoDocumentoRepository,
                        PersonaRepository personaRepository,
                        PasswordEncoder passwordEncoder) {

                return args -> {

                        /*
                         * =========================================================
                         * INICIALIZAR ROLES
                         * =========================================================
                         */

                        Rol rolAdmin = rolRepository.findByNombre("ADMIN")
                                        .orElseGet(() -> rolRepository.save(new Rol("ADMIN")));

                        if (rolRepository.findByNombre("SECRETARIA").isEmpty()) {
                                rolRepository.save(new Rol("SECRETARIA"));
                        }

                        if (rolRepository.findByNombre("SENSEI").isEmpty()) {
                                rolRepository.save(new Rol("SENSEI"));
                        }

                        if (rolRepository.findByNombre("ESTUDIANTE").isEmpty()) {
                                rolRepository.save(new Rol("ESTUDIANTE"));
                        }

                        /*
                         * =========================================================
                         * OBTENER TIPO DE DOCUMENTO DNI
                         * =========================================================
                         */

                        TipoDocumento tipoDocumentoDni = tipoDocumentoRepository
                                        .findByNombre("DNI")
                                        .orElseThrow(() -> new RuntimeException(
                                                        "El tipo de documento DNI no existe"));

                        /*
                         * =========================================================
                         * VERIFICAR SI YA EXISTE UN ADMINISTRADOR
                         * =========================================================
                         */

                        boolean existeAdmin = usuarioRepository
                                        .findAll()
                                        .stream()
                                        .anyMatch(usuario -> usuario.getRol() != null
                                                        && "ADMIN".equalsIgnoreCase(
                                                                        usuario.getRol().getNombre()));

                        /*
                         * =========================================================
                         * CREAR ADMINISTRADOR INICIAL
                         * =========================================================
                         */

                        if (!existeAdmin) {

                                /*
                                 * -----------------------------------------------------
                                 * CREAR PERSONA DEL ADMINISTRADOR
                                 * -----------------------------------------------------
                                 */

                                Persona personaAdmin = new Persona();

                                personaAdmin.setNombre("Administrador");
                                personaAdmin.setApellido("Sistema");
                                personaAdmin.setTipoDocumento(tipoDocumentoDni);
                                personaAdmin.setNumeroDocumento("00000000");
                                personaAdmin.setTelefono("+51900000000");
                                personaAdmin.setFechaNacimiento(
                                                LocalDate.of(1990, 1, 1));
                                personaAdmin.setGenero("NO_ESPECIFICADO");
                                personaAdmin.setCorreo("admin@kihon.com");

                                personaAdmin = personaRepository.save(personaAdmin);

                                /*
                                 * -----------------------------------------------------
                                 * CREAR USUARIO ADMINISTRADOR
                                 * -----------------------------------------------------
                                 */

                                Usuario admin = new Usuario();

                                admin.setPersona(personaAdmin);
                                admin.setUsername("admin");
                                admin.setPassword(
                                                passwordEncoder.encode("Admin12345"));
                                admin.setEstado("ACTIVO");
                                admin.setFechaRegistro(LocalDateTime.now());
                                admin.setRol(rolAdmin);

                                usuarioRepository.save(admin);

                                System.out.println(
                                                "========================================");
                                System.out.println(
                                                "USUARIO ADMIN CREADO");
                                System.out.println(
                                                "Usuario: admin");
                                System.out.println(
                                                "Contraseña: Admin12345");
                                System.out.println(
                                                "========================================");
                        }
                };
        }
}