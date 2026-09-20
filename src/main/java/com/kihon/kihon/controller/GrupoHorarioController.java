package com.kihon.kihon.controller;

import com.kihon.kihon.model.GrupoHorario;
import com.kihon.kihon.service.GrupoHorarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<List<GrupoHorarioResponse>> listarHorarios() {

        List<GrupoHorarioResponse> response = grupoHorarioService.listarHorarios()
                .stream()
                .map(this::convertirResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    // ==========================================
    // LISTAR POR GRUPO
    // ==========================================

    @GetMapping("/grupo/{grupoId}")
    public ResponseEntity<List<GrupoHorarioResponse>> listarPorGrupo(
            @PathVariable Long grupoId) {

        List<GrupoHorarioResponse> response = grupoHorarioService.listarPorGrupo(grupoId)
                .stream()
                .map(this::convertirResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    // ==========================================
    // BUSCAR POR ID
    // ==========================================

    @GetMapping("/{id}")
    public ResponseEntity<GrupoHorarioResponse> buscarPorId(
            @PathVariable Long id) {

        GrupoHorario horario = grupoHorarioService.buscarPorId(id);

        return ResponseEntity.ok(
                convertirResponse(horario));
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

        return ResponseEntity.ok(
                convertirResponse(horario));
    }

    // ==========================================
    // ELIMINAR
    // ==========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarHorario(
            @PathVariable Long id) {

        grupoHorarioService.eliminarHorario(id);

        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    private GrupoHorarioResponse convertirResponse(
            GrupoHorario horario) {

        return new GrupoHorarioResponse(
                horario.getId(),
                horario.getGrupo().getId(),
                horario.getGrupo().getNombre(),
                horario.getGrupo().getSensei() != null
                        ? horario.getGrupo().getSensei().getNombre()
                                + " "
                                + horario.getGrupo().getSensei().getApellido()
                        : null,
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