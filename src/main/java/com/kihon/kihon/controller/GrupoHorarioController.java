package com.kihon.kihon.controller;

import com.kihon.kihon.model.GrupoHorario;
import com.kihon.kihon.service.GrupoHorarioService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/grupo-horarios")
public class GrupoHorarioController {

        private final GrupoHorarioService grupoHorarioService;

        public GrupoHorarioController(
                        GrupoHorarioService grupoHorarioService) {

                this.grupoHorarioService = grupoHorarioService;
        }

        // ==========================================
        // LISTAR TODOS
        // ==========================================

        @GetMapping
        public ResponseEntity<List<GrupoHorarioResponse>> listarHorarios(
                        Authentication authentication) {

                validarRolConsulta(authentication);

                List<GrupoHorario> horarios;

                if (esSensei(authentication)) {

                        horarios = grupoHorarioService.listarPorSensei(
                                        authentication.getName());

                } else {

                        horarios = grupoHorarioService.listarHorarios();
                }

                List<GrupoHorarioResponse> response = horarios.stream()
                                .map(this::convertirResponse)
                                .toList();

                return ResponseEntity.ok(response);
        }

        // ==========================================
        // LISTAR POR DÍA
        // ==========================================

        @GetMapping("/dia/{diaSemana}")
        public ResponseEntity<List<GrupoHorarioResponse>> listarPorDia(
                        @PathVariable String diaSemana,
                        Authentication authentication) {

                validarRolConsulta(authentication);

                List<GrupoHorario> horarios;

                if (esSensei(authentication)) {

                        horarios = grupoHorarioService.listarPorDiaDeSensei(
                                        diaSemana,
                                        authentication.getName());

                } else {

                        horarios = grupoHorarioService.listarPorDia(diaSemana);
                }

                List<GrupoHorarioResponse> response = horarios.stream()
                                .map(this::convertirResponse)
                                .toList();

                return ResponseEntity.ok(response);
        }

        // ==========================================
        // LISTAR POR GRUPO
        // ==========================================

        @GetMapping("/grupo/{grupoId}")
        public ResponseEntity<List<GrupoHorarioResponse>> listarPorGrupo(
                        @PathVariable Long grupoId,
                        Authentication authentication) {

                validarRolConsulta(authentication);

                List<GrupoHorario> horarios;

                if (esSensei(authentication)) {

                        horarios = grupoHorarioService.listarPorGrupoDeSensei(
                                        grupoId,
                                        authentication.getName());

                } else {

                        horarios = grupoHorarioService.listarPorGrupo(grupoId);
                }

                List<GrupoHorarioResponse> response = horarios.stream()
                                .map(this::convertirResponse)
                                .toList();

                return ResponseEntity.ok(response);
        }

        // ==========================================
        // BUSCAR POR ID
        // ==========================================

        @GetMapping("/{id}")
        public ResponseEntity<GrupoHorarioResponse> buscarPorId(
                        @PathVariable Long id,
                        Authentication authentication) {

                validarRolConsulta(authentication);

                GrupoHorario horario;

                if (esSensei(authentication)) {

                        horario = grupoHorarioService.buscarPorIdDeSensei(
                                        id,
                                        authentication.getName());

                } else {

                        horario = grupoHorarioService.buscarPorId(id);
                }

                return ResponseEntity.ok(convertirResponse(horario));
        }

        // ==========================================
        // CREAR
        // ==========================================

        @PostMapping
        public ResponseEntity<GrupoHorarioResponse> crearHorario(
                        @RequestBody GrupoHorarioRequest request) {

                GrupoHorario horario = grupoHorarioService.crearHorario(
                                request.grupoId(),
                                request.diaSemana(),
                                request.horaInicio(),
                                request.horaFin());

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(convertirResponse(horario));
        }

        // ==========================================
        // ACTUALIZAR
        // ==========================================

        @PutMapping("/{id}")
        public ResponseEntity<GrupoHorarioResponse> actualizarHorario(
                        @PathVariable Long id,
                        @RequestBody GrupoHorarioRequest request) {

                GrupoHorario horario = grupoHorarioService.actualizarHorario(
                                id,
                                request.grupoId(),
                                request.diaSemana(),
                                request.horaInicio(),
                                request.horaFin());

                return ResponseEntity.ok(convertirResponse(horario));
        }

        // ==========================================
        // ELIMINAR
        // ==========================================

        @DeleteMapping("/{id}")
        public ResponseEntity<Void> eliminarHorario(
                        @PathVariable Long id) {

                grupoHorarioService.eliminarHorario(id);

                return ResponseEntity
                                .noContent()
                                .build();
        }

        // ==========================================
        // VALIDAR ROL DE CONSULTA
        // ==========================================

        private void validarRolConsulta(Authentication authentication) {

                if (authentication == null
                                || !authentication.isAuthenticated()) {

                        throw new AccessDeniedException(
                                        "Debes iniciar sesión para consultar horarios");
                }

                boolean autorizado = authentication.getAuthorities()
                                .stream()
                                .anyMatch(authority -> {

                                        String rol = authority.getAuthority();

                                        return "ROLE_ADMIN".equals(rol)
                                                        || "ROLE_SECRETARIA".equals(rol)
                                                        || "ROLE_SENSEI".equals(rol);
                                });

                if (!autorizado) {

                        throw new AccessDeniedException(
                                        "No tienes permisos para consultar horarios");
                }
        }

        // ==========================================
        // VALIDAR SI ES SENSEI
        // ==========================================

        private boolean esSensei(Authentication authentication) {

                return authentication != null
                                && authentication.getAuthorities().stream()
                                                .anyMatch(authority -> "ROLE_SENSEI".equals(
                                                                authority.getAuthority()));
        }

        // ==========================================
        // CONVERTIR RESPONSE
        // ==========================================

        private GrupoHorarioResponse convertirResponse(
                        GrupoHorario horario) {

                String senseiNombre = null;

                if (horario.getGrupo().getSensei() != null
                                && horario.getGrupo().getSensei().getPersona() != null) {

                        senseiNombre = horario.getGrupo()
                                        .getSensei()
                                        .getPersona()
                                        .getNombre()
                                        + " "
                                        + horario.getGrupo()
                                                        .getSensei()
                                                        .getPersona()
                                                        .getApellido();
                }

                return new GrupoHorarioResponse(
                                horario.getId(),
                                horario.getGrupo().getId(),
                                horario.getGrupo().getNombre(),
                                senseiNombre,
                                horario.getDiaSemana(),
                                horario.getHoraInicio(),
                                horario.getHoraFin());
        }

        // ==========================================
        // REQUEST
        // ==========================================

        public record GrupoHorarioRequest(
                        Long grupoId,
                        String diaSemana,
                        LocalTime horaInicio,
                        LocalTime horaFin) {
        }

        // ==========================================
        // RESPONSE
        // ==========================================

        public record GrupoHorarioResponse(
                        Long id,
                        Long grupoId,
                        String grupoNombre,
                        String senseiNombre,
                        String diaSemana,
                        LocalTime horaInicio,
                        LocalTime horaFin) {
        }
}
