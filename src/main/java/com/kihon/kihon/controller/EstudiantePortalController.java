package com.kihon.kihon.controller;

import com.kihon.kihon.dto.AsistenciaResponse;
import com.kihon.kihon.dto.GrupoEstudianteResponse;
import com.kihon.kihon.model.Asistencia;
import com.kihon.kihon.model.Estudiante;
import com.kihon.kihon.model.EstudianteGrupo;
import com.kihon.kihon.service.EstudiantePortalService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
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
}