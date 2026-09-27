package com.kihon.kihon.repository;

import com.kihon.kihon.model.Estudiante;
import com.kihon.kihon.model.Persona;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EstudianteRepository extends JpaRepository<Estudiante, Long> {

    /*
     * =========================================================
     * COMPATIBILIDAD TEMPORAL
     * =========================================================
     *
     * Estos métodos todavía pueden ser utilizados por código
     * antiguo del proyecto.
     *
     * Ahora los datos personales viven en Persona.
     */

    @Query("""
            SELECT e
            FROM Estudiante e
            WHERE e.persona.numeroDocumento = :documento
            """)
    Optional<Estudiante> findByDocumento(
            @Param("documento") String documento);

    @Query("""
            SELECT e
            FROM Estudiante e
            WHERE e.persona.correo = :correo
            """)
    Optional<Estudiante> findByCorreo(
            @Param("correo") String correo);

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