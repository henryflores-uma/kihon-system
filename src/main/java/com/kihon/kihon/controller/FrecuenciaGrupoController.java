package com.kihon.kihon.controller;

import com.kihon.kihon.dto.FrecuenciaGrupoResponse;
import com.kihon.kihon.model.FrecuenciaGrupo;
import com.kihon.kihon.service.FrecuenciaGrupoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/frecuencias-grupo")
public class FrecuenciaGrupoController {

    private final FrecuenciaGrupoService frecuenciaGrupoService;

    public FrecuenciaGrupoController(
            FrecuenciaGrupoService frecuenciaGrupoService) {

        this.frecuenciaGrupoService = frecuenciaGrupoService;
    }

    @GetMapping
    public ResponseEntity<List<FrecuenciaGrupoResponse>> listarFrecuencias() {

        List<FrecuenciaGrupoResponse> response = frecuenciaGrupoService.listarFrecuencias()
                .stream()
                .map(this::convertirAResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    private FrecuenciaGrupoResponse convertirAResponse(
            FrecuenciaGrupo frecuencia) {

        return new FrecuenciaGrupoResponse(
                frecuencia.getId(),
                frecuencia.getNombre(),
                frecuencia.getFrecuenciaSemanal());
    }
}