
package com.kihon.kihon.controller;

import com.kihon.kihon.dto.AsistenciaRequest;
import com.kihon.kihon.dto.AsistenciaResponse;
import com.kihon.kihon.model.Asistencia;
import com.kihon.kihon.service.AsistenciaService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/asistencias")
public class AsistenciaController {

        private final AsistenciaService asistenciaService;

        public AsistenciaController(AsistenciaService asistenciaService) {
                this.asistenciaService = asistenciaService;
        }

        // ==========================================
        // REGISTRAR
        // ==========================================

        @PostMapping
        public ResponseEntity<AsistenciaResponse> registrarAsistencia(
                        @RequestBody AsistenciaRequest request,
                        Authentication authentication) {

                Asistencia asistencia;

                if (esSensei(authentication)) {
                        asistencia = asistenciaService.registrarAsistenciaDeSensei(
                                        request.getEstudianteId(),
                                        request.getGrupoId(),
                                        request.getFecha(),
                                        request.getHoraLlegada(),
                                        request.getEstado(),
                                        request.getObservacion(),
                                        authentication.getName());
                } else {
                        asistencia = asistenciaService.registrarAsistencia(
                                        request.getEstudianteId(),
                                        request.getGrupoId(),
                                        request.getFecha(),
                                        request.getHoraLlegada(),
                                        request.getEstado(),
                                        request.getObservacion());
                }

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(convertirAResponse(asistencia));
        }

        // ==========================================
        // ACTUALIZAR
        // ==========================================

        @PutMapping("/{id}")
        public ResponseEntity<AsistenciaResponse> actualizarAsistencia(
                        @PathVariable Long id,
                        @RequestBody AsistenciaRequest request,
                        Authentication authentication) {

                Asistencia asistencia;

                if (esSensei(authentication)) {
                        asistencia = asistenciaService.actualizarAsistenciaDeSensei(
                                        id,
                                        request.getEstudianteId(),
                                        request.getGrupoId(),
                                        request.getFecha(),
                                        request.getHoraLlegada(),
                                        request.getEstado(),
                                        request.getObservacion(),
                                        authentication.getName());
                } else {
                        asistencia = asistenciaService.actualizarAsistencia(
                                        id,
                                        request.getEstudianteId(),
                                        request.getGrupoId(),
                                        request.getFecha(),
                                        request.getHoraLlegada(),
                                        request.getEstado(),
                                        request.getObservacion());
                }

                return ResponseEntity.ok(convertirAResponse(asistencia));
        }

        // ==========================================
        // LISTAR POR ESTUDIANTE
        // ==========================================

        @GetMapping("/estudiante/{estudianteId}")
        public ResponseEntity<List<AsistenciaResponse>> listarPorEstudiante(
                        @PathVariable Long estudianteId,
                        Authentication authentication) {

                List<Asistencia> asistencias;

                if (esSensei(authentication)) {
                        asistencias = asistenciaService.listarPorEstudianteDeSensei(
                                        estudianteId,
                                        authentication.getName());
                } else {
                        asistencias = asistenciaService.listarPorEstudiante(estudianteId);
                }

                return ResponseEntity.ok(
                                asistencias.stream()
                                                .map(this::convertirAResponse)
                                                .toList());
        }

        // ==========================================
        // LISTAR POR GRUPO
        // ==========================================

        @GetMapping("/grupo/{grupoId}")
        public ResponseEntity<List<AsistenciaResponse>> listarPorGrupo(
                        @PathVariable Long grupoId,
                        Authentication authentication) {

                List<Asistencia> asistencias;

                if (esSensei(authentication)) {
                        asistencias = asistenciaService.listarPorGrupoDeSensei(
                                        grupoId,
                                        authentication.getName());
                } else {
                        asistencias = asistenciaService.listarPorGrupo(grupoId);
                }

                return ResponseEntity.ok(
                                asistencias.stream()
                                                .map(this::convertirAResponse)
                                                .toList());
        }

        // ==========================================
        // LISTAR POR FECHA
        // ==========================================

        @GetMapping("/fecha/{fecha}")
        public ResponseEntity<List<AsistenciaResponse>> listarPorFecha(
                        @PathVariable LocalDate fecha,
                        Authentication authentication) {

                List<Asistencia> asistencias;

                if (esSensei(authentication)) {
                        asistencias = asistenciaService.listarPorFechaDeSensei(
                                        fecha,
                                        authentication.getName());
                } else {
                        asistencias = asistenciaService.listarPorFecha(fecha);
                }

                return ResponseEntity.ok(
                                asistencias.stream()
                                                .map(this::convertirAResponse)
                                                .toList());
        }

        // ==========================================
        // ESTUDIANTE + FECHA
        // ==========================================

        @GetMapping("/estudiante/{estudianteId}/fecha/{fecha}")
        public ResponseEntity<List<AsistenciaResponse>> listarPorEstudianteYFecha(
                        @PathVariable Long estudianteId,
                        @PathVariable LocalDate fecha,
                        Authentication authentication) {

                List<Asistencia> asistencias;

                if (esSensei(authentication)) {
                        asistencias = asistenciaService.listarPorEstudianteYFechaDeSensei(
                                        estudianteId,
                                        fecha,
                                        authentication.getName());
                } else {
                        asistencias = asistenciaService.listarPorEstudianteYFecha(
                                        estudianteId,
                                        fecha);
                }

                return ResponseEntity.ok(
                                asistencias.stream()
                                                .map(this::convertirAResponse)
                                                .toList());
        }

        // ==========================================
        // GRUPO + FECHA
        // ==========================================

        @GetMapping("/grupo/{grupoId}/fecha/{fecha}")
        public ResponseEntity<List<AsistenciaResponse>> listarPorGrupoYFecha(
                        @PathVariable Long grupoId,
                        @PathVariable LocalDate fecha,
                        Authentication authentication) {

                List<Asistencia> asistencias;

                if (esSensei(authentication)) {
                        asistencias = asistenciaService.listarPorGrupoYFechaDeSensei(
                                        grupoId,
                                        fecha,
                                        authentication.getName());
                } else {
                        asistencias = asistenciaService.listarPorGrupoYFecha(
                                        grupoId,
                                        fecha);
                }

                return ResponseEntity.ok(
                                asistencias.stream()
                                                .map(this::convertirAResponse)
                                                .toList());
        }

        // ==========================================
        // IDENTIFICAR ROL
        // ==========================================

        private boolean esSensei(Authentication authentication) {

                if (authentication == null
                                || authentication.getAuthorities() == null) {
                        return false;
                }

                for (GrantedAuthority authority : authentication.getAuthorities()) {

                        if (authority != null
                                        && "ROLE_SENSEI".equals(authority.getAuthority())) {
                                return true;
                        }
                }

                return false;
        }

        // ==========================================
        // RESPONSE
        // ==========================================

        private AsistenciaResponse convertirAResponse(Asistencia asistencia) {

                String estudianteNombre = asistencia.getEstudiante()
                                .getPersona()
                                .getNombre()
                                + " "
                                + asistencia.getEstudiante()
                                                .getPersona()
                                                .getApellido();

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
