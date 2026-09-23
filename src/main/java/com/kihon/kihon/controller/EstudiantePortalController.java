package com.kihon.kihon.controller;

import com.kihon.kihon.dto.AsistenciaResponse;
import com.kihon.kihon.dto.CambiarPasswordRequest;
import com.kihon.kihon.dto.EstudiantePerfilRequest;
import com.kihon.kihon.dto.GrupoEstudianteResponse;
import com.kihon.kihon.model.Asistencia;
import com.kihon.kihon.model.Estudiante;
import com.kihon.kihon.model.EstudianteGrupo;
import com.kihon.kihon.model.GrupoHorario;
import com.kihon.kihon.repository.GrupoHorarioRepository;
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
        private final GrupoHorarioRepository grupoHorarioRepository;

        public EstudiantePortalController(
                        EstudiantePortalService estudiantePortalService,
                        GrupoHorarioRepository grupoHorarioRepository) {

                this.estudiantePortalService = estudiantePortalService;
                this.grupoHorarioRepository = grupoHorarioRepository;
        }

        /*
         * =========================================================
         * PERFIL DEL ESTUDIANTE
         * =========================================================
         */

        @GetMapping("/api/estudiante")
        public Estudiante estudiante(
                        Authentication authentication) {

                return estudiantePortalService.obtenerEstudianteAutenticado(
                                authentication.getName());
        }

        /*
         * =========================================================
         * ASISTENCIAS
         * =========================================================
         */

        @GetMapping("/api/estudiante/asistencias")
        public List<AsistenciaResponse> listarMisAsistencias(
                        Authentication authentication) {

                return estudiantePortalService
                                .listarMisAsistencias(authentication.getName())
                                .stream()
                                .map(this::convertirAResponse)
                                .toList();
        }

        /*
         * =========================================================
         * GRUPOS
         * =========================================================
         */

        @GetMapping("/api/estudiante/grupos")
        public List<GrupoEstudianteResponse> listarMisGrupos(
                        Authentication authentication) {

                return estudiantePortalService
                                .listarMisGrupos(authentication.getName())
                                .stream()
                                .map(this::convertirGrupoAResponse)
                                .toList();
        }

        /*
         * =========================================================
         * CONVERTIR GRUPO A RESPONSE
         * =========================================================
         */

        private GrupoEstudianteResponse convertirGrupoAResponse(
                        EstudianteGrupo estudianteGrupo) {

                Long grupoId = estudianteGrupo.getGrupo().getId();

                List<GrupoEstudianteResponse.HorarioResponse> horarios = grupoHorarioRepository
                                .findByGrupoId(grupoId)
                                .stream()
                                .map(this::convertirHorarioAResponse)
                                .toList();

                return new GrupoEstudianteResponse(
                                grupoId,
                                estudianteGrupo.getGrupo().getNombre(),
                                estudianteGrupo.getGrupo().getDescripcion(),
                                horarios,
                                estudianteGrupo.getGrupo().getEstado());
        }

        /*
         * =========================================================
         * CONVERTIR HORARIO A RESPONSE
         * =========================================================
         */

        private GrupoEstudianteResponse.HorarioResponse convertirHorarioAResponse(
                        GrupoHorario horario) {

                return new GrupoEstudianteResponse.HorarioResponse(
                                horario.getDiaSemana(),
                                horario.getHoraInicio(),
                                horario.getHoraFin());
        }

        /*
         * =========================================================
         * CONVERTIR ASISTENCIA A RESPONSE
         * =========================================================
         */

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

        /*
         * =========================================================
         * ACTUALIZAR PERFIL DEL ESTUDIANTE
         * =========================================================
         */

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

        /*
         * =========================================================
         * CAMBIAR CONTRASEÑA DEL ESTUDIANTE
         * =========================================================
         */

        @PutMapping("/api/estudiante/password")
        public ResponseEntity<String> cambiarPassword(
                        Authentication authentication,
                        @RequestBody CambiarPasswordRequest request) {

                estudiantePortalService.cambiarPassword(
                                authentication.getName(),
                                request.getPasswordActual(),
                                request.getPasswordNueva());

                return ResponseEntity.ok(
                                "Contraseña actualizada correctamente");
        }
}