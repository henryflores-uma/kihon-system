
package com.kihon.kihon.config;

import com.kihon.kihon.model.Rol;
import com.kihon.kihon.repository.RolRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

        @Bean
        CommandLineRunner inicializarDatos(
                        RolRepository rolRepository) {

                return args -> {

                        /*
                         * ==========================================
                         * INICIALIZAR ROLES
                         * ==========================================
                         */

                        if (rolRepository.findByNombre("ADMIN").isEmpty()) {
                                rolRepository.save(new Rol("ADMIN"));
                        }

                        if (rolRepository.findByNombre("SECRETARIA").isEmpty()) {
                                rolRepository.save(new Rol("SECRETARIA"));
                        }

                        if (rolRepository.findByNombre("SENSEI").isEmpty()) {
                                rolRepository.save(new Rol("SENSEI"));
                        }

                        if (rolRepository.findByNombre("ESTUDIANTE").isEmpty()) {
                                rolRepository.save(new Rol("ESTUDIANTE"));
                        }

                };
        }
}
