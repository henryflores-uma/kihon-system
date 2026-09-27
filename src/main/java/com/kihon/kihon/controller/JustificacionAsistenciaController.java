package com.kihon.kihon.controller;

import com.kihon.kihon.dto.JustificacionAsistenciaRequest;
import com.kihon.kihon.dto.JustificacionAsistenciaResponse;
import com.kihon.kihon.model.JustificacionAsistencia;
import com.kihon.kihon.model.Persona;
import com.kihon.kihon.service.JustificacionAsistenciaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/justificaciones-asistencia")
public class JustificacionAsistenciaController {

    private final JustificacionAsistenciaService justificacionService;

    public JustificacionAsistenciaController(
            JustificacionAsistenciaService justificacionService) {

        this.justificacionService = justificacionService;
    }

    @PostMapping
    public ResponseEntity<JustificacionAsistenciaResponse> crear(
            @RequestBody JustificacionAsistenciaRequest request) {

        JustificacionAsistencia justificacion = justificacionService.crearJustificacion(
                request.getAsistenciaId(),
                request.getMotivoId(),
                request.getDescripcion());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(convertirAResponse(justificacion));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JustificacionAsistenciaResponse> buscarPorId(
            @PathVariable Long id) {

        JustificacionAsistencia justificacion = justificacionService.buscarPorId(id);

        return ResponseEntity.ok(
                convertirAResponse(justificacion));
    }

    @GetMapping("/asistencia/{asistenciaId}")
    public ResponseEntity<JustificacionAsistenciaResponse> buscarPorAsistencia(
            @PathVariable Long asistenciaId) {

        JustificacionAsistencia justificacion = justificacionService.buscarPorAsistencia(asistenciaId);

        return ResponseEntity.ok(
                convertirAResponse(justificacion));
    }

    @GetMapping
    public ResponseEntity<List<JustificacionAsistenciaResponse>> listar() {

        List<JustificacionAsistenciaResponse> response = justificacionService.listarJustificaciones()
                .stream()
                .map(this::convertirAResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    private JustificacionAsistenciaResponse convertirAResponse(
            JustificacionAsistencia justificacion) {

        String registradoPorNombre = null;

        if (justificacion.getRegistradoPor() != null
                && justificacion.getRegistradoPor().getPersona() != null) {

            Persona persona = justificacion.getRegistradoPor().getPersona();

            registradoPorNombre = persona.getNombre()
                    + " "
                    + persona.getApellido();
        }

        return new JustificacionAsistenciaResponse(
                justificacion.getId(),
                justificacion.getAsistencia().getId(),
                justificacion.getMotivo().getId(),
                justificacion.getMotivo().getNombre(),
                justificacion.getDescripcion(),
                justificacion.getFechaRegistro(),
                justificacion.getRegistradoPor().getId(),
                registradoPorNombre);
    }
}