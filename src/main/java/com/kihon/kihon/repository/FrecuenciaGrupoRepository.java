package com.kihon.kihon.repository;

import com.kihon.kihon.model.FrecuenciaGrupo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FrecuenciaGrupoRepository
        extends JpaRepository<FrecuenciaGrupo, Long> {

    Optional<FrecuenciaGrupo> findByNombre(String nombre);

    List<FrecuenciaGrupo> findAllByOrderByFrecuenciaSemanalAsc();
}