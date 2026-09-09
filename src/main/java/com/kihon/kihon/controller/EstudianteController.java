package com.kihon.kihon.controller;

import com.kihon.kihon.dto.EstudianteRequest;
import com.kihon.kihon.dto.EstudianteResponse;
import com.kihon.kihon.model.Estudiante;
import com.kihon.kihon.service.EstudianteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/estudiantes")
public class EstudianteController {

    private final EstudianteService estudianteService;

    public EstudianteController(EstudianteService estudianteService) {
        this.estudianteService = estudianteService;
    }

    @PostMapping
    public ResponseEntity<EstudianteResponse> crearEstudiante(
            @RequestBody EstudianteRequest request) {

        Estudiante estudiante = estudianteService.crearEstudiante(
                request.getNombre(),
                request.getApellido(),
                request.getDocumento(),
                request.getTelefono(),
                request.getCorreo());

        EstudianteResponse response = new EstudianteResponse(
                estudiante.getId(),
                estudiante.getNombre(),
                estudiante.getApellido(),
                estudiante.getDocumento(),
                estudiante.getTelefono(),
                estudiante.getCorreo(),
                estudiante.getEstado());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<EstudianteResponse>> listarEstudiantes(
            @RequestParam(required = false) String estado) {

        List<Estudiante> estudiantes;

        if (estado == null || estado.isBlank()) {
            estudiantes = estudianteService.listarEstudiantes();
        } else {
            estudiantes = estudianteService.listarPorEstado(
                    estado.toUpperCase());
        }

        List<EstudianteResponse> response = estudiantes
                .stream()
                .map(estudiante -> new EstudianteResponse(
                        estudiante.getId(),
                        estudiante.getNombre(),
                        estudiante.getApellido(),
                        estudiante.getDocumento(),
                        estudiante.getTelefono(),
                        estudiante.getCorreo(),
                        estudiante.getEstado()))
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EstudianteResponse> buscarPorId(
            @PathVariable Long id) {

        Estudiante estudiante = estudianteService.buscarPorId(id);

        EstudianteResponse response = new EstudianteResponse(
                estudiante.getId(),
                estudiante.getNombre(),
                estudiante.getApellido(),
                estudiante.getDocumento(),
                estudiante.getTelefono(),
                estudiante.getCorreo(),
                estudiante.getEstado());

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EstudianteResponse> actualizarEstudiante(
            @PathVariable Long id,
            @RequestBody EstudianteRequest request) {

        Estudiante estudiante = estudianteService.actualizarEstudiante(
                id,
                request.getNombre(),
                request.getApellido(),
                request.getDocumento(),
                request.getTelefono(),
                request.getCorreo());

        EstudianteResponse response = new EstudianteResponse(
                estudiante.getId(),
                estudiante.getNombre(),
                estudiante.getApellido(),
                estudiante.getDocumento(),
                estudiante.getTelefono(),
                estudiante.getCorreo(),
                estudiante.getEstado());

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<EstudianteResponse> cambiarEstado(
            @PathVariable Long id,
            @RequestParam String estado) {

        Estudiante estudiante = estudianteService.cambiarEstado(id, estado);

        EstudianteResponse response = new EstudianteResponse(
                estudiante.getId(),
                estudiante.getNombre(),
                estudiante.getApellido(),
                estudiante.getDocumento(),
                estudiante.getTelefono(),
                estudiante.getCorreo(),
                estudiante.getEstado());

        return ResponseEntity.ok(response);
    }
}