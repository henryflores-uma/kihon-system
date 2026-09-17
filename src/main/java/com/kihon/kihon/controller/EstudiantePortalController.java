package com.kihon.kihon.controller;

import com.kihon.kihon.dto.AsistenciaResponse;
import com.kihon.kihon.dto.CambiarPasswordRequest;
import com.kihon.kihon.dto.EstudiantePerfilRequest;
import com.kihon.kihon.dto.GrupoEstudianteResponse;
import com.kihon.kihon.model.Asistencia;
import com.kihon.kihon.model.Estudiante;
import com.kihon.kihon.model.EstudianteGrupo;
import com.kihon.kihon.service.EstudiantePortalService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class EstudiantePortalController {

        private final EstudiantePortalService estudiantePortalService;

        public EstudiantePortalController(
                        EstudiantePortalService estudiantePortalService) {

                this.estudiantePortalService = estudiantePortalService;
        }

        @GetMapping("/api/estudiante")
        public Estudiante estudiante(Authentication authentication) {

                return estudiantePortalService.obtenerEstudianteAutenticado(
                                authentication.getName());
        }

        @GetMapping("/api/estudiante/asistencias")
        public List<AsistenciaResponse> listarMisAsistencias(
                        Authentication authentication) {

                return estudiantePortalService
                                .listarMisAsistencias(authentication.getName())
                                .stream()
                                .map(this::convertirAResponse)
                                .toList();
        }

        @GetMapping("/api/estudiante/grupos")
        public List<GrupoEstudianteResponse> listarMisGrupos(
                        Authentication authentication) {

                return estudiantePortalService
                                .listarMisGrupos(authentication.getName())
                                .stream()
                                .map(this::convertirGrupoAResponse)
                                .toList();
        }

        private GrupoEstudianteResponse convertirGrupoAResponse(
                        EstudianteGrupo estudianteGrupo) {

                return new GrupoEstudianteResponse(
                                estudianteGrupo.getGrupo().getId(),
                                estudianteGrupo.getGrupo().getNombre(),
                                estudianteGrupo.getGrupo().getDescripcion(),
                                estudianteGrupo.getGrupo().getHoraInicio(),
                                estudianteGrupo.getGrupo().getHoraFin(),
                                estudianteGrupo.getGrupo().getEstado());
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

        @PutMapping("/api/estudiante/perfil")
        public Estudiante actualizarPerfil(
                        Authentication authentication,
                        @RequestBody EstudiantePerfilRequest request) {

                return estudiantePortalService.actualizarPerfil(
                                authentication.getName(),
                                request.getNombre(),
                                request.getApellido(),
                                request.getTelefono(),
                                request.getCorreo(),
                                request.getDireccion(),
                                request.getFoto());
        }

        @PutMapping("/api/estudiante/password")
        public ResponseEntity<String> cambiarPassword(
                        Authentication authentication,
                        @RequestBody CambiarPasswordRequest request) {

                estudiantePortalService.cambiarPassword(
                                authentication.getName(),
                                request.getPasswordActual(),
                                request.getNuevaPassword());

                return ResponseEntity.ok(
                                "Contraseña actualizada correctamente");
        }
}