package com.kihon.kihon.repository;

import com.kihon.kihon.model.Asistencia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AsistenciaRepository
                extends JpaRepository<Asistencia, Long> {

        List<Asistencia> findByEstudianteId(Long estudianteId);

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
}