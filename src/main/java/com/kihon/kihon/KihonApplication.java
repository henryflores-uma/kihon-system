package com.kihon.kihon;

import com.kihon.kihon.model.Rol;
import com.kihon.kihon.repository.RolRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class KihonApplication {

	public static void main(String[] args) {
		SpringApplication.run(KihonApplication.class, args);
	}

	@Bean
	CommandLineRunner inicializarRoles(RolRepository rolRepository) {
		return args -> {

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