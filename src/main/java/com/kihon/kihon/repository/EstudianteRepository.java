package com.kihon.kihon.repository;

import com.kihon.kihon.model.Estudiante;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EstudianteRepository extends JpaRepository<Estudiante, Long> {

    Optional<Estudiante> findByDocumento(String documento);

    Optional<Estudiante> findByCorreo(String correo);

    List<Estudiante> findByEstado(String estado);
}