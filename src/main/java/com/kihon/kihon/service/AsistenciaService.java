package com.kihon.kihon.service;

import com.kihon.kihon.model.Asistencia;
import com.kihon.kihon.model.Estudiante;
import com.kihon.kihon.model.Grupo;
import com.kihon.kihon.repository.AsistenciaRepository;
import com.kihon.kihon.repository.EstudianteGrupoRepository;
import com.kihon.kihon.repository.EstudianteRepository;
import com.kihon.kihon.repository.GrupoRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class AsistenciaService {

    private final AsistenciaRepository asistenciaRepository;
    private final EstudianteRepository estudianteRepository;
    private final GrupoRepository grupoRepository;
    private final EstudianteGrupoRepository estudianteGrupoRepository;

    public AsistenciaService(
            AsistenciaRepository asistenciaRepository,
            EstudianteRepository estudianteRepository,
            GrupoRepository grupoRepository,
            EstudianteGrupoRepository estudianteGrupoRepository) {

        this.asistenciaRepository = asistenciaRepository;
        this.estudianteRepository = estudianteRepository;
        this.grupoRepository = grupoRepository;
        this.estudianteGrupoRepository = estudianteGrupoRepository;
    }

    public Asistencia registrarAsistencia(
            Long estudianteId,
            Long grupoId,
            LocalDate fecha,
            LocalTime horaLlegada,
            String estado,
            String observacion) {

        Estudiante estudiante = estudianteRepository.findById(estudianteId)
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));

        Grupo grupo = grupoRepository.findById(grupoId)
                .orElseThrow(() -> new RuntimeException("Grupo no encontrado"));

        if (!grupo.getEstado().equals("ACTIVO")) {
            throw new RuntimeException(
                    "No se puede registrar asistencia en un grupo inactivo");
        }

        if (!estudianteGrupoRepository
                .existsByEstudianteIdAndGrupoIdAndEstado(
                        estudianteId,
                        grupoId,
                        "ACTIVO")) {

            throw new RuntimeException(
                    "El estudiante no está asignado activamente a este grupo");
        }

        if (estado == null) {
            throw new RuntimeException(
                    "El estado de la asistencia es obligatorio");
        }

        estado = estado.toUpperCase();

        if (!estado.equals("PRESENTE")
                && !estado.equals("AUSENTE")
                && !estado.equals("TARDANZA")) {

            throw new RuntimeException(
                    "El estado debe ser PRESENTE, AUSENTE o TARDANZA");
        }

        if (fecha == null) {
            throw new RuntimeException(
                    "La fecha es obligatoria");
        }

        if (estado.equals("PRESENTE")
                || estado.equals("TARDANZA")) {

            if (horaLlegada == null) {
                throw new RuntimeException(
                        "La hora de llegada es obligatoria para PRESENTE o TARDANZA");
            }
        }

        if (estado.equals("AUSENTE")
                && horaLlegada != null) {

            throw new RuntimeException(
                    "Un estudiante AUSENTE no debe tener hora de llegada");
        }

        if (asistenciaRepository
                .existsByEstudianteIdAndGrupoIdAndFecha(
                        estudianteId,
                        grupoId,
                        fecha)) {

            throw new RuntimeException(
                    "El estudiante ya tiene asistencia registrada para este grupo en esta fecha");
        }

        Asistencia asistencia = new Asistencia();

        asistencia.setEstudiante(estudiante);
        asistencia.setGrupo(grupo);
        asistencia.setFecha(fecha);
        asistencia.setHoraLlegada(horaLlegada);
        asistencia.setEstado(estado);
        asistencia.setObservacion(observacion);

        return asistenciaRepository.save(asistencia);
    }

    public List<Asistencia> listarPorEstudiante(Long estudianteId) {
        return asistenciaRepository.findByEstudianteId(estudianteId);
    }

    public List<Asistencia> listarPorGrupo(Long grupoId) {
        return asistenciaRepository.findByGrupoId(grupoId);
    }

    public List<Asistencia> listarPorFecha(LocalDate fecha) {
        return asistenciaRepository.findByFecha(fecha);
    }

    public List<Asistencia> listarPorEstudianteYFecha(
            Long estudianteId,
            LocalDate fecha) {

        return asistenciaRepository
                .findByEstudianteIdAndFecha(
                        estudianteId,
                        fecha);
    }

    public List<Asistencia> listarPorGrupoYFecha(
            Long grupoId,
            LocalDate fecha) {

        return asistenciaRepository
                .findByGrupoIdAndFecha(
                        grupoId,
                        fecha);
    }
}