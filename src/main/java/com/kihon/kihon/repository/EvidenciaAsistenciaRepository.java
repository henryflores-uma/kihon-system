package com.kihon.kihon.repository;

import com.kihon.kihon.model.EvidenciaAsistencia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EvidenciaAsistenciaRepository
        extends JpaRepository<EvidenciaAsistencia, Long> {

    List<EvidenciaAsistencia> findByJustificacionId(Long justificacionId);
}