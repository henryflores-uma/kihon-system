package com.kihon.kihon.controller;

import com.kihon.kihon.model.Evento;
import com.kihon.kihon.service.EventoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/eventos")
public class EventoController {

    private final EventoService eventoService;

    public EventoController(EventoService eventoService) {
        this.eventoService = eventoService;
    }

    /*
     * ==========================================
     * LISTAR EVENTOS
     * ==========================================
     */

    @GetMapping
    public ResponseEntity<List<EventoResponse>> listarEventos(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) LocalDate fechaInicio,
            @RequestParam(required = false) LocalDate fechaFin) {

        List<Evento> eventos;

        /*
         * FILTRAR POR RANGO DE FECHAS
         */

        if (fechaInicio != null || fechaFin != null) {

            if (fechaInicio == null || fechaFin == null) {

                throw new RuntimeException(
                        "Debes indicar fechaInicio y fechaFin");
            }

            eventos = eventoService.listarPorRango(
                    fechaInicio,
                    fechaFin);

            /*
             * FILTRAR POR ESTADO
             */

        } else if (estado != null && !estado.isBlank()) {

            eventos = eventoService.listarPorEstado(
                    estado.toUpperCase());

            /*
             * TODOS
             */

        } else {

            eventos = eventoService.listarEventos();
        }

        List<EventoResponse> response = eventos.stream()
                .map(this::convertirResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    /*
     * ==========================================
     * BUSCAR POR ID
     * ==========================================
     */

    @GetMapping("/{id}")
    public ResponseEntity<EventoResponse> buscarPorId(
            @PathVariable Long id) {

        Evento evento = eventoService.buscarPorId(id);

        return ResponseEntity.ok(
                convertirResponse(evento));
    }

    /*
     * ==========================================
     * CREAR EVENTO
     * ==========================================
     */

    @PostMapping
    public ResponseEntity<EventoResponse> crearEvento(
            @RequestBody EventoRequest request) {

        Evento evento = eventoService.crearEvento(
                request.titulo(),
                request.tipo(),
                request.descripcion(),
                request.fecha(),
                request.horaInicio(),
                request.horaFin(),
                request.lugar(),
                request.responsableId());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(convertirResponse(evento));
    }

    /*
     * ==========================================
     * ACTUALIZAR EVENTO
     * ==========================================
     */

    @PutMapping("/{id}")
    public ResponseEntity<EventoResponse> actualizarEvento(
            @PathVariable Long id,
            @RequestBody EventoRequest request) {

        Evento evento = eventoService.actualizarEvento(
                id,
                request.titulo(),
                request.tipo(),
                request.descripcion(),
                request.fecha(),
                request.horaInicio(),
                request.horaFin(),
                request.lugar(),
                request.responsableId());

        return ResponseEntity.ok(
                convertirResponse(evento));
    }

    /*
     * ==========================================
     * CAMBIAR ESTADO
     * ==========================================
     */

    @PatchMapping("/{id}/estado")
    public ResponseEntity<EventoResponse> cambiarEstado(
            @PathVariable Long id,
            @RequestParam String estado) {

        Evento evento = eventoService.cambiarEstado(
                id,
                estado.toUpperCase());

        return ResponseEntity.ok(
                convertirResponse(evento));
    }

    /*
     * ==========================================
     * ELIMINAR EVENTO
     * ==========================================
     */

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarEvento(
            @PathVariable Long id) {

        eventoService.eliminarEvento(id);

        return ResponseEntity.noContent().build();
    }

    /*
     * ==========================================
     * CONVERTIR A RESPONSE
     * ==========================================
     */

    private EventoResponse convertirResponse(
            Evento evento) {

        return new EventoResponse(
                evento.getId(),
                evento.getTitulo(),
                evento.getTipo(),
                evento.getDescripcion(),
                evento.getFecha(),
                evento.getHoraInicio(),
                evento.getHoraFin(),
                evento.getLugar(),
                evento.getResponsable() != null
                        ? evento.getResponsable().getId()
                        : null,
                evento.getResponsable() != null
                        ? evento.getResponsable().getNombre()
                                + " "
                                + evento.getResponsable().getApellido()
                        : null,
                evento.getEstado());
    }

    /*
     * ==========================================
     * REQUEST
     * ==========================================
     */

    public record EventoRequest(
            String titulo,
            String tipo,
            String descripcion,
            LocalDate fecha,
            LocalTime horaInicio,
            LocalTime horaFin,
            String lugar,
            Long responsableId) {
    }

    /*
     * ==========================================
     * RESPONSE
     * ==========================================
     */

    public record EventoResponse(
            Long id,
            String titulo,
            String tipo,
            String descripcion,
            LocalDate fecha,
            LocalTime horaInicio,
            LocalTime horaFin,
            String lugar,
            Long responsableId,
            String responsableNombre,
            String estado) {
    }
}