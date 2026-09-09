package com.kihon.kihon.controller;

import com.kihon.kihon.dto.GrupoRequest;
import com.kihon.kihon.dto.GrupoResponse;
import com.kihon.kihon.model.Grupo;
import com.kihon.kihon.service.GrupoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grupos")
public class GrupoController {

        private final GrupoService grupoService;

        public GrupoController(GrupoService grupoService) {
                this.grupoService = grupoService;
        }

        @PostMapping
        public ResponseEntity<GrupoResponse> crearGrupo(
                        @RequestBody GrupoRequest request) {

                Grupo grupo = grupoService.crearGrupo(
                                request.getNombre(),
                                request.getDescripcion(),
                                request.getHoraInicio(),
                                request.getHoraFin(),
                                request.getCapacidad());

                GrupoResponse response = convertirAResponse(grupo);

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(response);
        }

        @GetMapping
        public ResponseEntity<List<GrupoResponse>> listarGrupos(
                        @RequestParam(required = false) String estado) {

                List<Grupo> grupos;

                if (estado == null || estado.isBlank()) {
                        grupos = grupoService.listarGrupos();
                } else {
                        grupos = grupoService.listarPorEstado(
                                        estado.toUpperCase());
                }

                List<GrupoResponse> response = grupos
                                .stream()
                                .map(this::convertirAResponse)
                                .toList();

                return ResponseEntity.ok(response);
        }

        @GetMapping("/{id}")
        public ResponseEntity<GrupoResponse> buscarPorId(
                        @PathVariable Long id) {

                Grupo grupo = grupoService.buscarPorId(id);

                return ResponseEntity.ok(
                                convertirAResponse(grupo));
        }

        @PutMapping("/{id}")
        public ResponseEntity<GrupoResponse> actualizarGrupo(
                        @PathVariable Long id,
                        @RequestBody GrupoRequest request) {

                Grupo grupo = grupoService.actualizarGrupo(
                                id,
                                request.getNombre(),
                                request.getDescripcion(),
                                request.getHoraInicio(),
                                request.getHoraFin(),
                                request.getCapacidad());

                return ResponseEntity.ok(
                                convertirAResponse(grupo));
        }

        @PatchMapping("/{id}/estado")
        public ResponseEntity<GrupoResponse> cambiarEstado(
                        @PathVariable Long id,
                        @RequestParam String estado) {

                Grupo grupo = grupoService.cambiarEstado(
                                id,
                                estado.toUpperCase());

                return ResponseEntity.ok(
                                convertirAResponse(grupo));
        }

        private GrupoResponse convertirAResponse(Grupo grupo) {

                long estudiantesActivos = grupoService
                                .contarEstudiantesActivos(grupo.getId());

                long cuposDisponibles = grupo.getCapacidad() - estudiantesActivos;

                return new GrupoResponse(
                                grupo.getId(),
                                grupo.getNombre(),
                                grupo.getDescripcion(),
                                grupo.getHoraInicio(),
                                grupo.getHoraFin(),
                                grupo.getCapacidad(),
                                estudiantesActivos,
                                cuposDisponibles,
                                grupo.getEstado());
        }
}