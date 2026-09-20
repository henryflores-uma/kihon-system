package com.kihon.kihon.repository;

import com.kihon.kihon.model.GrupoHorario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GrupoHorarioRepository
        extends JpaRepository<GrupoHorario, Long> {

    List<GrupoHorario> findByGrupoId(Long grupoId);

    List<GrupoHorario> findByDiaSemana(String diaSemana);
}