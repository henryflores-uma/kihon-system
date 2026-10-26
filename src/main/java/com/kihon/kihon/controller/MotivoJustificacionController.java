package com.kihon.kihon.controller;

import com.kihon.kihon.dto.MotivoJustificacionResponse;
import com.kihon.kihon.repository.MotivoJustificacionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/motivos-justificacion")
public class MotivoJustificacionController {

    private final MotivoJustificacionRepository motivoRepository;

    public MotivoJustificacionController(
            MotivoJustificacionRepository motivoRepository) {

        this.motivoRepository = motivoRepository;
    }

    @GetMapping
    public ResponseEntity<List<MotivoJustificacionResponse>> listarMotivos() {

        List<MotivoJustificacionResponse> response = motivoRepository.findAllByOrderByIdAsc()
                .stream()
                .map(motivo -> new MotivoJustificacionResponse(
                        motivo.getId(),
                        motivo.getNombre()))
                .toList();

        return ResponseEntity.ok(response);
    }
}