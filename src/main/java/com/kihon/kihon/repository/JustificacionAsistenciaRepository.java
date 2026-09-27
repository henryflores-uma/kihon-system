package com.kihon.kihon.repository;

import com.kihon.kihon.model.JustificacionAsistencia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface JustificacionAsistenciaRepository
        extends JpaRepository<JustificacionAsistencia, Long> {

    Optional<JustificacionAsistencia> findByAsistenciaId(Long asistenciaId);

    boolean existsByAsistenciaId(Long asistenciaId);
}