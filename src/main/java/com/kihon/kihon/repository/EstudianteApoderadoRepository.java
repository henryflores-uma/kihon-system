package com.kihon.kihon.repository;

import com.kihon.kihon.model.EstudianteApoderado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EstudianteApoderadoRepository
        extends JpaRepository<EstudianteApoderado, Long> {

    List<EstudianteApoderado> findByEstudianteId(
            Long estudianteId);

    Optional<EstudianteApoderado> findByEstudianteIdAndApoderadoId(
            Long estudianteId,
            Long apoderadoId);
}