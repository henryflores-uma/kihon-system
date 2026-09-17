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

        public EstudianteController(
                        EstudianteService estudianteService) {

                this.estudianteService = estudianteService;
        }

        @PostMapping
        public ResponseEntity<EstudianteResponse> crearEstudiante(
                        @RequestBody EstudianteRequest request) {

                Estudiante estudiante = estudianteService.crearEstudiante(
                                request.getNombre(),
                                request.getApellido(),
                                request.getTipoDocumento(),
                                request.getDocumento(),
                                request.getTelefono(),
                                request.getCorreo(),
                                request.getFechaNacimiento(),
                                request.getDireccion(),
                                request.getFoto());

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(convertirResponse(estudiante));
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

                List<EstudianteResponse> response = estudiantes.stream()
                                .map(this::convertirResponse)
                                .toList();

                return ResponseEntity.ok(response);
        }

        @GetMapping("/{id}")
        public ResponseEntity<EstudianteResponse> buscarPorId(
                        @PathVariable Long id) {

                Estudiante estudiante = estudianteService.buscarPorId(id);

                return ResponseEntity.ok(
                                convertirResponse(estudiante));
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

                return ResponseEntity.ok(
                                convertirResponse(estudiante));
        }

        @PatchMapping("/{id}/estado")
        public ResponseEntity<EstudianteResponse> cambiarEstado(
                        @PathVariable Long id,
                        @RequestParam String estado) {

                Estudiante estudiante = estudianteService.cambiarEstado(
                                id,
                                estado.toUpperCase());

                return ResponseEntity.ok(
                                convertirResponse(estudiante));
        }

        private EstudianteResponse convertirResponse(
                        Estudiante estudiante) {

                return new EstudianteResponse(
                                estudiante.getId(),
                                estudiante.getNombre(),
                                estudiante.getApellido(),
                                estudiante.getTipoDocumento(),
                                estudiante.getDocumento(),
                                estudiante.getTelefono(),
                                estudiante.getCorreo(),
                                estudiante.getFechaNacimiento(),
                                estudiante.getDireccion(),
                                estudiante.getFoto(),
                                estudiante.getEstado());
        }
}