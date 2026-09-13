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

        /*
         * ================================
         * ASIGNAR ESTUDIANTE A GRUPO
         * =================================
         */

        @PostMapping
        public ResponseEntity<EstudianteGrupoResponse> asignarEstudianteAGrupo(
                        @RequestBody EstudianteGrupoRequest request) {

                EstudianteGrupo estudianteGrupo = estudianteGrupoService
                                .asignarEstudianteAGrupo(
                                                request.getEstudianteId(),
                                                request.getGrupoId());

                EstudianteGrupoResponse response = convertirAResponse(estudianteGrupo);

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(response);
        }

        /*
         * ================================
         * LISTAR TODAS LAS ASIGNACIONES
         * =================================
         */

        @GetMapping
        public ResponseEntity<List<EstudianteGrupoResponse>> listarTodas() {

                List<EstudianteGrupoResponse> response = estudianteGrupoService
                                .listarTodas()
                                .stream()
                                .map(this::convertirAResponse)
                                .toList();

                return ResponseEntity.ok(response);
        }

        /*
         * ================================
         * CAMBIAR GRUPO
         * =================================
         */

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

        /*
         * ================================
         * LISTAR POR ESTUDIANTE
         * =================================
         */

        @GetMapping("/estudiante/{estudianteId}")
        public ResponseEntity<List<EstudianteGrupoResponse>> listarPorEstudiante(
                        @PathVariable Long estudianteId) {

                List<EstudianteGrupoResponse> response = estudianteGrupoService
                                .listarPorEstudiante(
                                                estudianteId)
                                .stream()
                                .map(this::convertirAResponse)
                                .toList();

                return ResponseEntity.ok(response);
        }

        /*
         * ================================
         * LISTAR POR GRUPO
         * =================================
         */

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

        /*
         * ================================
         * CAMBIAR ESTADO
         * =================================
         */

        @PatchMapping("/{id}/estado")
        public ResponseEntity<EstudianteGrupoResponse> cambiarEstado(
                        @PathVariable Long id,
                        @RequestParam String estado) {

                EstudianteGrupo estudianteGrupo = estudianteGrupoService.cambiarEstado(
                                id,
                                estado);

                EstudianteGrupoResponse response = convertirAResponse(estudianteGrupo);

                return ResponseEntity.ok(response);
        }

        /*
         * ================================
         * CONVERTIR A RESPONSE
         * =================================
         */

        private EstudianteGrupoResponse convertirAResponse(
                        EstudianteGrupo estudianteGrupo) {

                return new EstudianteGrupoResponse(
                                estudianteGrupo.getId(),

                                estudianteGrupo
                                                .getEstudiante()
                                                .getId(),

                                estudianteGrupo
                                                .getEstudiante()
                                                .getNombre(),

                                estudianteGrupo
                                                .getGrupo()
                                                .getId(),

                                estudianteGrupo
                                                .getGrupo()
                                                .getNombre(),

                                estudianteGrupo.getEstado());
        }
}