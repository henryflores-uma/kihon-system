package com.kihon.kihon.repository;

import com.kihon.kihon.model.Estudiante;
import com.kihon.kihon.model.Persona;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EstudianteRepository extends JpaRepository<Estudiante, Long> {

        /*
         * =========================================================
         * ESTUDIANTE ↔ PERSONA
         * =========================================================
         */

        Optional<Estudiante> findByPersona(Persona persona);

        /*
         * =========================================================
         * ESTADO
         * =========================================================
         */

        List<Estudiante> findByEstado(String estado);
}