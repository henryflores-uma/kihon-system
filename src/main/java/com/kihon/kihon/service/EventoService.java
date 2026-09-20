package com.kihon.kihon.service;

import com.kihon.kihon.model.Evento;
import com.kihon.kihon.model.Usuario;
import com.kihon.kihon.repository.EventoRepository;
import com.kihon.kihon.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class EventoService {

    private final EventoRepository eventoRepository;
    private final UsuarioRepository usuarioRepository;

    public EventoService(
            EventoRepository eventoRepository,
            UsuarioRepository usuarioRepository) {

        this.eventoRepository = eventoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<Evento> listarEventos() {

        return eventoRepository.findAll();
    }

    public List<Evento> listarPorEstado(String estado) {

        validarEstado(estado);

        return eventoRepository.findByEstado(
                estado.toUpperCase());
    }

    public List<Evento> listarPorRango(
            LocalDate fechaInicio,
            LocalDate fechaFin) {

        if (fechaInicio == null || fechaFin == null) {

            throw new RuntimeException(
                    "La fecha de inicio y la fecha de fin son obligatorias");
        }

        if (fechaInicio.isAfter(fechaFin)) {

            throw new RuntimeException(
                    "La fecha de inicio no puede ser posterior a la fecha de fin");
        }

        return eventoRepository.findByFechaBetween(
                fechaInicio,
                fechaFin);
    }

    public Evento buscarPorId(Long id) {

        return eventoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Evento no encontrado"));
    }

    public Evento crearEvento(
            String titulo,
            String tipo,
            String descripcion,
            LocalDate fecha,
            LocalTime horaInicio,
            LocalTime horaFin,
            String lugar,
            Long responsableId) {

        validarDatos(
                titulo,
                tipo,
                fecha,
                horaInicio,
                horaFin);

        Evento evento = new Evento();

        evento.setTitulo(titulo.trim());
        evento.setTipo(tipo.toUpperCase());
        evento.setDescripcion(
                descripcion != null
                        ? descripcion.trim()
                        : null);
        evento.setFecha(fecha);
        evento.setHoraInicio(horaInicio);
        evento.setHoraFin(horaFin);
        evento.setLugar(
                lugar != null
                        ? lugar.trim()
                        : null);
        evento.setEstado("ACTIVO");

        if (responsableId != null) {

            Usuario responsable = obtenerResponsable(responsableId);

            evento.setResponsable(responsable);
        }

        return eventoRepository.save(evento);
    }

    public Evento actualizarEvento(
            Long id,
            String titulo,
            String tipo,
            String descripcion,
            LocalDate fecha,
            LocalTime horaInicio,
            LocalTime horaFin,
            String lugar,
            Long responsableId) {

        Evento evento = eventoRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Evento no encontrado"));

        validarDatos(
                titulo,
                tipo,
                fecha,
                horaInicio,
                horaFin);

        evento.setTitulo(titulo.trim());
        evento.setTipo(tipo.toUpperCase());
        evento.setDescripcion(
                descripcion != null
                        ? descripcion.trim()
                        : null);
        evento.setFecha(fecha);
        evento.setHoraInicio(horaInicio);
        evento.setHoraFin(horaFin);
        evento.setLugar(
                lugar != null
                        ? lugar.trim()
                        : null);

        if (responsableId != null) {

            Usuario responsable = obtenerResponsable(responsableId);

            evento.setResponsable(responsable);

        } else {

            evento.setResponsable(null);
        }

        return eventoRepository.save(evento);
    }

    public Evento cambiarEstado(
            Long id,
            String estado) {

        validarEstado(estado);

        Evento evento = eventoRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Evento no encontrado"));

        evento.setEstado(
                estado.toUpperCase());

        return eventoRepository.save(evento);
    }

    public void eliminarEvento(Long id) {

        if (!eventoRepository.existsById(id)) {

            throw new RuntimeException(
                    "Evento no encontrado");
        }

        eventoRepository.deleteById(id);
    }

    private void validarDatos(
            String titulo,
            String tipo,
            LocalDate fecha,
            LocalTime horaInicio,
            LocalTime horaFin) {

        if (titulo == null
                || titulo.isBlank()) {

            throw new RuntimeException(
                    "El título del evento es obligatorio");
        }

        if (tipo == null
                || tipo.isBlank()) {

            throw new RuntimeException(
                    "El tipo de evento es obligatorio");
        }

        validarTipo(tipo);

        if (fecha == null) {

            throw new RuntimeException(
                    "La fecha del evento es obligatoria");
        }

        if (horaInicio == null
                || horaFin == null) {

            throw new RuntimeException(
                    "La hora de inicio y la hora de fin son obligatorias");
        }

        if (!horaInicio.isBefore(horaFin)) {

            throw new RuntimeException(
                    "La hora de inicio debe ser anterior a la hora de fin");
        }
    }

    private void validarTipo(String tipo) {

        String tipoNormalizado = tipo.toUpperCase();

        if (!tipoNormalizado.equals("EXAMEN")
                && !tipoNormalizado.equals("SEMINARIO")
                && !tipoNormalizado.equals("RECUPERACION")
                && !tipoNormalizado.equals("REFUERZO")
                && !tipoNormalizado.equals("OTRO")) {

            throw new RuntimeException(
                    "El tipo de evento no es válido");
        }
    }

    private void validarEstado(String estado) {

        if (estado == null
                || estado.isBlank()) {

            throw new RuntimeException(
                    "El estado es obligatorio");
        }

        String estadoNormalizado = estado.toUpperCase();

        if (!estadoNormalizado.equals("ACTIVO")
                && !estadoNormalizado.equals("CANCELADO")) {

            throw new RuntimeException(
                    "El estado debe ser ACTIVO o CANCELADO");
        }
    }

    private Usuario obtenerResponsable(
            Long responsableId) {

        Usuario usuario = usuarioRepository.findById(
                responsableId)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Responsable no encontrado"));

        if (!"ACTIVO".equalsIgnoreCase(
                usuario.getEstado())) {

            throw new RuntimeException(
                    "El responsable seleccionado no está activo");
        }

        return usuario;
    }
}