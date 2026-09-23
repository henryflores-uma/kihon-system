package com.kihon.kihon.service;

import com.kihon.kihon.model.FrecuenciaGrupo;
import com.kihon.kihon.repository.FrecuenciaGrupoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FrecuenciaGrupoService {

    private final FrecuenciaGrupoRepository frecuenciaGrupoRepository;

    public FrecuenciaGrupoService(
            FrecuenciaGrupoRepository frecuenciaGrupoRepository) {

        this.frecuenciaGrupoRepository = frecuenciaGrupoRepository;
    }

    public List<FrecuenciaGrupo> listarFrecuencias() {

        return frecuenciaGrupoRepository
                .findAllByOrderByFrecuenciaSemanalAsc();
    }
}