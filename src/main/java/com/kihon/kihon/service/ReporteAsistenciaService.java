package com.kihon.kihon.service;

import com.kihon.kihon.dto.AsistenciaResponse;
import com.kihon.kihon.dto.ReporteAsistenciaResponse;
import com.kihon.kihon.model.Asistencia;
import com.kihon.kihon.repository.AsistenciaRepository;
import com.kihon.kihon.repository.EstudianteRepository;
import com.kihon.kihon.repository.GrupoRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ReporteAsistenciaService {

    private final AsistenciaRepository asistenciaRepository;
    private final EstudianteRepository estudianteRepository;
    private final GrupoRepository grupoRepository;

    public ReporteAsistenciaService(
            AsistenciaRepository asistenciaRepository,
            EstudianteRepository estudianteRepository,
            GrupoRepository grupoRepository) {

        this.asistenciaRepository = asistenciaRepository;
        this.estudianteRepository = estudianteRepository;
        this.grupoRepository = grupoRepository;
    }

    public ReporteAsistenciaResponse generarReporteDiario(
            LocalDate fecha) {

        if (fecha == null) {
            throw new RuntimeException(
                    "La fecha es obligatoria");
        }

        List<Asistencia> asistencias = asistenciaRepository.findByFecha(fecha);

        return construirReporte(
                fecha,
                fecha,
                asistencias);
    }

    public ReporteAsistenciaResponse generarReporteSemanal(
            LocalDate fechaInicio,
            LocalDate fechaFin) {

        validarPeriodo(fechaInicio, fechaFin);

        List<Asistencia> asistencias = asistenciaRepository.findByFechaBetween(
                fechaInicio,
                fechaFin);

        return construirReporte(
                fechaInicio,
                fechaFin,
                asistencias);
    }

    public ReporteAsistenciaResponse generarReporteMensual(
            int anio,
            int mes) {

        if (mes < 1 || mes > 12) {
            throw new RuntimeException(
                    "El mes debe estar entre 1 y 12");
        }

        LocalDate fechaInicio = LocalDate.of(anio, mes, 1);

        LocalDate fechaFin = fechaInicio.withDayOfMonth(
                fechaInicio.lengthOfMonth());

        List<Asistencia> asistencias = asistenciaRepository.findByFechaBetween(
                fechaInicio,
                fechaFin);

        return construirReporte(
                fechaInicio,
                fechaFin,
                asistencias);
    }

    public ReporteAsistenciaResponse generarReportePorEstudiante(
            Long estudianteId) {

        if (estudianteId == null) {
            throw new RuntimeException(
                    "El ID del estudiante es obligatorio");
        }

        estudianteRepository.findById(estudianteId)
                .orElseThrow(() -> new RuntimeException(
                        "Estudiante no encontrado"));

        List<Asistencia> asistencias = asistenciaRepository.findByEstudianteId(
                estudianteId);

        if (asistencias.isEmpty()) {
            return construirReporte(
                    null,
                    null,
                    asistencias);
        }

        LocalDate fechaInicio = asistencias.stream()
                .map(asistencia -> asistencia.getFecha())
                .min(java.util.Comparator.naturalOrder())
                .orElseThrow();

        LocalDate fechaFin = asistencias.stream()
                .map(asistencia -> asistencia.getFecha())
                .max(java.util.Comparator.naturalOrder())
                .orElseThrow();

        return construirReporte(
                fechaInicio,
                fechaFin,
                asistencias);
    }

    public ReporteAsistenciaResponse generarReportePorGrupo(
            Long grupoId) {

        if (grupoId == null) {
            throw new RuntimeException(
                    "El ID del grupo es obligatorio");
        }

        grupoRepository.findById(grupoId)
                .orElseThrow(() -> new RuntimeException(
                        "Grupo no encontrado"));

        List<Asistencia> asistencias = asistenciaRepository.findByGrupoId(
                grupoId);

        if (asistencias.isEmpty()) {
            return construirReporte(
                    null,
                    null,
                    asistencias);
        }

        LocalDate fechaInicio = asistencias.stream()
                .map(asistencia -> asistencia.getFecha())
                .min(java.util.Comparator.naturalOrder())
                .orElseThrow();

        LocalDate fechaFin = asistencias.stream()
                .map(asistencia -> asistencia.getFecha())
                .max(java.util.Comparator.naturalOrder())
                .orElseThrow();
        return construirReporte(
                fechaInicio,
                fechaFin,
                asistencias);
    }

    private ReporteAsistenciaResponse construirReporte(
            LocalDate fechaInicio,
            LocalDate fechaFin,
            List<Asistencia> asistencias) {

        int total = asistencias.size();

        int presentes = (int) asistencias.stream()
                .filter(a -> "PRESENTE".equals(a.getEstado()))
                .count();

        int tardanzas = (int) asistencias.stream()
                .filter(a -> "TARDANZA".equals(a.getEstado()))
                .count();

        int ausentes = (int) asistencias.stream()
                .filter(a -> "AUSENTE".equals(a.getEstado()))
                .count();

        double porcentajeAsistencia = 0.0;

        if (total > 0) {
            porcentajeAsistencia = ((double) (presentes + tardanzas) / total)
                    * 100;

            porcentajeAsistencia = Math.round(porcentajeAsistencia * 100.0)
                    / 100.0;
        }

        List<AsistenciaResponse> detalle = asistencias.stream()
                .map(this::convertirAResponse)
                .toList();

        return new ReporteAsistenciaResponse(
                fechaInicio,
                fechaFin,
                total,
                presentes,
                tardanzas,
                ausentes,
                porcentajeAsistencia,
                detalle);
    }

    private void validarPeriodo(
            LocalDate fechaInicio,
            LocalDate fechaFin) {

        if (fechaInicio == null || fechaFin == null) {
            throw new RuntimeException(
                    "Las fechas de inicio y fin son obligatorias");
        }

        if (fechaInicio.isAfter(fechaFin)) {
            throw new RuntimeException(
                    "La fecha de inicio no puede ser posterior a la fecha de fin");
        }
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