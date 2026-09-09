package com.kihon.kihon.controller;

import com.kihon.kihon.dto.EstudianteGrupoRequest;
import com.kihon.kihon.dto.EstudianteGrupoResponse;
import com.kihon.kihon.model.EstudianteGrupo;
import com.kihon.kihon.service.EstudianteGrupoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/estudiantes-grupos")
public class EstudianteGrupoController {

    private final EstudianteGrupoService estudianteGrupoService;

    public EstudianteGrupoController(
            EstudianteGrupoService estudianteGrupoService) {

        this.estudianteGrupoService = estudianteGrupoService;
    }

    @PostMapping
    public ResponseEntity<EstudianteGrupoResponse> asignarEstudianteAGrupo(
            @RequestBody EstudianteGrupoRequest request) {

        EstudianteGrupo estudianteGrupo = estudianteGrupoService.asignarEstudianteAGrupo(
                request.getEstudianteId(),
                request.getGrupoId());

        EstudianteGrupoResponse response = convertirAResponse(estudianteGrupo);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PatchMapping("/estudiante/{estudianteId}/grupo/{nuevoGrupoId}")
    public ResponseEntity<EstudianteGrupoResponse> cambiarGrupo(
            @PathVariable Long estudianteId,
            @PathVariable Long nuevoGrupoId) {

        EstudianteGrupo estudianteGrupo = estudianteGrupoService.cambiarGrupo(
                estudianteId,
                nuevoGrupoId);

        EstudianteGrupoResponse response = convertirAResponse(estudianteGrupo);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/estudiante/{estudianteId}")
    public ResponseEntity<List<EstudianteGrupoResponse>> listarPorEstudiante(
            @PathVariable Long estudianteId) {

        List<EstudianteGrupoResponse> response = estudianteGrupoService
                .listarPorEstudiante(estudianteId)
                .stream()
                .map(this::convertirAResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/grupo/{grupoId}")
    public ResponseEntity<List<EstudianteGrupoResponse>> listarPorGrupo(
            @PathVariable Long grupoId) {

        List<EstudianteGrupoResponse> response = estudianteGrupoService
                .listarPorGrupo(grupoId)
                .stream()
                .map(this::convertirAResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    private EstudianteGrupoResponse convertirAResponse(
            EstudianteGrupo estudianteGrupo) {

        return new EstudianteGrupoResponse(
                estudianteGrupo.getId(),
                estudianteGrupo.getEstudiante().getId(),
                estudianteGrupo.getEstudiante().getNombre(),
                estudianteGrupo.getGrupo().getId(),
                estudianteGrupo.getGrupo().getNombre(),
                estudianteGrupo.getEstado());
    }
}