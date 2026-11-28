package com.kihon.kihon.repository;

import com.kihon.kihon.model.Asistencia;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AsistenciaRepository
                extends JpaRepository<Asistencia, Long> {

        List<Asistencia> findByEstudianteId(Long estudianteId);

        Page<Asistencia> findByEstudianteIdOrderByFechaDescIdDesc(
                        Long estudianteId,
                        Pageable pageable);

        Page<Asistencia> findByEstudianteIdAndEstadoIgnoreCaseOrderByFechaDescIdDesc(
                        Long estudianteId,
                        String estado,
                        Pageable pageable);

        @Query("""
                        SELECT a.estado, COUNT(a)
                        FROM Asistencia a
                        WHERE a.estudiante.id = :estudianteId
                        GROUP BY a.estado
                        """)
        List<Object[]> contarPorEstadoYEstudiante(
                        @Param("estudianteId") Long estudianteId);

        List<Asistencia> findByGrupoId(Long grupoId);

        List<Asistencia> findByFecha(LocalDate fecha);

        List<Asistencia> findByEstudianteIdAndFecha(
                        Long estudianteId,
                        LocalDate fecha);

        List<Asistencia> findByGrupoIdAndFecha(
                        Long grupoId,
                        LocalDate fecha);

        List<Asistencia> findByFechaBetween(
                        LocalDate fechaInicio,
                        LocalDate fechaFin);

        List<Asistencia> findByEstudianteIdAndFechaBetween(
                        Long estudianteId,
                        LocalDate fechaInicio,
                        LocalDate fechaFin);

        List<Asistencia> findByGrupoIdAndFechaBetween(
                        Long grupoId,
                        LocalDate fechaInicio,
                        LocalDate fechaFin);

        boolean existsByEstudianteIdAndGrupoIdAndFecha(
                        Long estudianteId,
                        Long grupoId,
                        LocalDate fecha);

        List<Asistencia> findTop5ByEstudianteIdOrderByFechaDescIdDesc(
                        Long estudianteId);
}