package com.kihon.kihon.repository;

import com.kihon.kihon.model.EstudianteGrupo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EstudianteGrupoRepository
                extends JpaRepository<EstudianteGrupo, Long> {

        List<EstudianteGrupo> findByEstudianteId(Long estudianteId);

        List<EstudianteGrupo> findByGrupoId(Long grupoId);

        List<EstudianteGrupo> findByEstado(String estado);

        boolean existsByEstudianteIdAndGrupoIdAndEstado(
                        Long estudianteId,
                        Long grupoId,
                        String estado);

        List<EstudianteGrupo> findByEstudianteIdAndEstado(
                        Long estudianteId,
                        String estado);

        long countByGrupoIdAndEstado(
                        Long grupoId,
                        String estado);
}