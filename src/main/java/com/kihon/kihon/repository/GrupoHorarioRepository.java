
package com.kihon.kihon.repository;

import com.kihon.kihon.model.GrupoHorario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GrupoHorarioRepository extends JpaRepository<GrupoHorario, Long> {

    List<GrupoHorario> findByGrupoId(Long grupoId);

    List<GrupoHorario> findByDiaSemana(String diaSemana);

    List<GrupoHorario> findByGrupo_Sensei_Id(Long senseiId);

    List<GrupoHorario> findByDiaSemanaAndGrupo_Sensei_Id(
            String diaSemana,
            Long senseiId);
}
