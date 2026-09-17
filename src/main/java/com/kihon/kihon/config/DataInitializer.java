package com.kihon.kihon.config;

import com.kihon.kihon.model.Rol;
import com.kihon.kihon.model.Usuario;
import com.kihon.kihon.repository.RolRepository;
import com.kihon.kihon.repository.UsuarioRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner inicializarDatos(
            RolRepository rolRepository,
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            Rol rolAdmin = rolRepository.findByNombre("ADMIN")
                    .orElseThrow(() -> new RuntimeException(
                            "El rol ADMIN no existe"));

            boolean existeAdmin = usuarioRepository
                    .findAll()
                    .stream()
                    .anyMatch(usuario -> usuario.getRol() != null
                            && "ADMIN".equalsIgnoreCase(
                                    usuario.getRol().getNombre()));

            if (!existeAdmin) {

                Usuario admin = new Usuario();

                admin.setUsername("admin");
                admin.setPassword(
                        passwordEncoder.encode("Admin12345"));

                admin.setNombre("Administrador");
                admin.setApellido("Sistema");

                admin.setTipoDocumento("DNI");
                admin.setNumeroDocumento("00000000");

                admin.setTelefono("+51900000000");

                admin.setFechaNacimiento(
                        LocalDate.of(1990, 1, 1));

                admin.setGenero("NO_ESPECIFICADO");

                admin.setCorreo("admin@kihon.com");

                admin.setEstado("ACTIVO");

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