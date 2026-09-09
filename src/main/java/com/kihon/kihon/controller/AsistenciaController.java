package com.kihon.kihon.controller;

import com.kihon.kihon.dto.AsistenciaRequest;
import com.kihon.kihon.dto.AsistenciaResponse;
import com.kihon.kihon.model.Asistencia;
import com.kihon.kihon.service.AsistenciaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/asistencias")
public class AsistenciaController {

    private final AsistenciaService asistenciaService;

    public AsistenciaController(
            AsistenciaService asistenciaService) {

        this.asistenciaService = asistenciaService;
    }

    @PostMapping
    public ResponseEntity<AsistenciaResponse> registrarAsistencia(
            @RequestBody AsistenciaRequest request) {

        Asistencia asistencia = asistenciaService.registrarAsistencia(
                request.getEstudianteId(),
                request.getGrupoId(),
                request.getFecha(),
                request.getHoraLlegada(),
                request.getEstado(),
                request.getObservacion());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(convertirAResponse(asistencia));
    }

    @GetMapping("/estudiante/{estudianteId}")
    public ResponseEntity<List<AsistenciaResponse>> listarPorEstudiante(
            @PathVariable Long estudianteId) {

        List<AsistenciaResponse> response = asistenciaService
                .listarPorEstudiante(estudianteId)
                .stream()
                .map(this::convertirAResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/grupo/{grupoId}")
    public ResponseEntity<List<AsistenciaResponse>> listarPorGrupo(
            @PathVariable Long grupoId) {

        List<AsistenciaResponse> response = asistenciaService
                .listarPorGrupo(grupoId)
                .stream()
                .map(this::convertirAResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/fecha/{fecha}")
    public ResponseEntity<List<AsistenciaResponse>> listarPorFecha(
            @PathVariable LocalDate fecha) {

        List<AsistenciaResponse> response = asistenciaService
                .listarPorFecha(fecha)
                .stream()
                .map(this::convertirAResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/estudiante/{estudianteId}/fecha/{fecha}")
    public ResponseEntity<List<AsistenciaResponse>> listarPorEstudianteYFecha(
            @PathVariable Long estudianteId,
            @PathVariable LocalDate fecha) {

        List<AsistenciaResponse> response = asistenciaService
                .listarPorEstudianteYFecha(
                        estudianteId,
                        fecha)
                .stream()
                .map(this::convertirAResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/grupo/{grupoId}/fecha/{fecha}")
    public ResponseEntity<List<AsistenciaResponse>> listarPorGrupoYFecha(
            @PathVariable Long grupoId,
            @PathVariable LocalDate fecha) {

        List<AsistenciaResponse> response = asistenciaService
                .listarPorGrupoYFecha(
                        grupoId,
                        fecha)
                .stream()
                .map(this::convertirAResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    private AsistenciaResponse convertirAResponse(
            Asistencia asistencia) {

        String estudianteNombre = asistencia.getEstudiante().getNombre()
                + " "
                + asistencia.getEstudiante().getApellido();

        return new AsistenciaResponse(
                asistencia.getId(),
                asistencia.getEstudiante().getId(),
                estudianteNombre,
                asistencia.getGrupo().getId(),
                asistencia.getGrupo().getNombre(),
                asistencia.getFecha(),
                asistencia.getHoraLlegada(),
                asistencia.getEstado(),
                asistencia.getObservacion());
    }
}