package com.kihon.kihon.service;

import com.kihon.kihon.dto.AsistenciaPageResponse;
import com.kihon.kihon.model.Asistencia;
import com.kihon.kihon.model.Estudiante;
import com.kihon.kihon.model.Grupo;
import com.kihon.kihon.repository.AsistenciaRepository;
import com.kihon.kihon.repository.EstudianteRepository;
import com.kihon.kihon.repository.GrupoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class AsistenciaService {

    private final AsistenciaRepository asistenciaRepository;
    private final EstudianteRepository estudianteRepository;
    private final GrupoRepository grupoRepository;

    public AsistenciaService(
            AsistenciaRepository asistenciaRepository,
            EstudianteRepository estudianteRepository,
            GrupoRepository grupoRepository) {
        this.asistenciaRepository = asistenciaRepository;
        this.estudianteRepository = estudianteRepository;
        this.grupoRepository = grupoRepository;
    }

    // =========================================================
    // PAGINACIÓN Y RESUMEN PARA ESTUDIANTE
    // =========================================================

    @Transactional(readOnly = true)
    public Page<Asistencia> listarPorEstudiantePaginado(
            Long estudianteId,
            String estado,
            Pageable pageable) {

        if (estado != null && !estado.isBlank() && !"TODOS".equalsIgnoreCase(estado)) {
            return asistenciaRepository.findByEstudianteIdAndEstadoIgnoreCaseOrderByFechaDescIdDesc(
                    estudianteId,
                    estado.trim(),
                    pageable);
        }

        return asistenciaRepository.findByEstudianteIdOrderByFechaDescIdDesc(
                estudianteId,
                pageable);
    }

    @Transactional(readOnly = true)
    public AsistenciaPageResponse.ResumenAsistencia obtenerResumenPorEstudiante(
            Long estudianteId) {

        List<Object[]> filas = asistenciaRepository.contarPorEstadoYEstudiante(estudianteId);

        long presentes = 0;
        long tardanzas = 0;
        long ausencias = 0;
        long justificados = 0;

        for (Object[] fila : filas) {
            String estado = fila[0] != null
                    ? fila[0].toString().trim().toUpperCase()
                    : "";
            long cantidad = fila[1] != null
                    ? ((Number) fila[1]).longValue()
                    : 0L;

            switch (estado) {
                case "PRESENTE" -> presentes += cantidad;
                case "TARDANZA" -> tardanzas += cantidad;
                case "AUSENTE" -> ausencias += cantidad;
                case "JUSTIFICADO" -> justificados += cantidad;
                default -> {
                }
            }
        }

        long total = presentes + tardanzas + ausencias + justificados;

        return new AsistenciaPageResponse.ResumenAsistencia(
                total,
                presentes,
                tardanzas,
                ausencias,
                justificados);
    }

    // =========================================================
    // REGISTRO Y ACTUALIZACIÓN
    // =========================================================

    @Transactional
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

        Asistencia asistencia = new Asistencia();
        asistencia.setEstudiante(estudiante);
        asistencia.setGrupo(grupo);
        asistencia.setFecha(fecha != null ? fecha : LocalDate.now());
        asistencia.setHoraLlegada(horaLlegada);
        asistencia.setEstado(estado != null ? estado.trim().toUpperCase() : "PRESENTE");
        asistencia.setObservacion(observacion);

        return asistenciaRepository.save(asistencia);
    }

    @Transactional
    public Asistencia registrarAsistenciaDeSensei(
            Long estudianteId,
            Long grupoId,
            LocalDate fecha,
            LocalTime horaLlegada,
            String estado,
            String observacion,
            String username) {

        return registrarAsistencia(
                estudianteId,
                grupoId,
                fecha,
                horaLlegada,
                estado,
                observacion);
    }

    @Transactional
    public Asistencia actualizarAsistencia(
            Long id,
            Long estudianteId,
            Long grupoId,
            LocalDate fecha,
            LocalTime horaLlegada,
            String estado,
            String observacion) {

        Asistencia asistencia = asistenciaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asistencia no encontrada"));

        if (estudianteId != null) {
            Estudiante estudiante = estudianteRepository.findById(estudianteId)
                    .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));
            asistencia.setEstudiante(estudiante);
        }

        if (grupoId != null) {
            Grupo grupo = grupoRepository.findById(grupoId)
                    .orElseThrow(() -> new RuntimeException("Grupo no encontrado"));
            asistencia.setGrupo(grupo);
        }

        if (fecha != null) {
            asistencia.setFecha(fecha);
        }

        asistencia.setHoraLlegada(horaLlegada);

        if (estado != null && !estado.isBlank()) {
            asistencia.setEstado(estado.trim().toUpperCase());
        }

        asistencia.setObservacion(observacion);

        return asistenciaRepository.save(asistencia);
    }

    @Transactional
    public Asistencia actualizarAsistenciaDeSensei(
            Long id,
            Long estudianteId,
            Long grupoId,
            LocalDate fecha,
            LocalTime horaLlegada,
            String estado,
            String observacion,
            String username) {

        return actualizarAsistencia(
                id,
                estudianteId,
                grupoId,
                fecha,
                horaLlegada,
                estado,
                observacion);
    }

    // =========================================================
    // CONSULTAS GENERALES Y POR ROL
    // =========================================================

    @Transactional(readOnly = true)
    public List<Asistencia> listarPorEstudiante(Long estudianteId) {
        return asistenciaRepository.findByEstudianteId(estudianteId);
    }

    @Transactional(readOnly = true)
    public List<Asistencia> listarPorEstudianteDeSensei(
            Long estudianteId,
            String username) {
        return asistenciaRepository.findByEstudianteId(estudianteId);
    }

    @Transactional(readOnly = true)
    public List<Asistencia> listarUltimasPorEstudiante(Long estudianteId) {
        return asistenciaRepository.findTop5ByEstudianteIdOrderByFechaDescIdDesc(estudianteId);
    }

    @Transactional(readOnly = true)
    public List<Asistencia> listarPorGrupo(Long grupoId) {
        return asistenciaRepository.findByGrupoId(grupoId);
    }

    @Transactional(readOnly = true)
    public List<Asistencia> listarPorGrupoDeSensei(
            Long grupoId,
            String username) {
        return asistenciaRepository.findByGrupoId(grupoId);
    }

    @Transactional(readOnly = true)
    public List<Asistencia> listarPorFecha(LocalDate fecha) {
        return asistenciaRepository.findByFecha(fecha);
    }

    @Transactional(readOnly = true)
    public List<Asistencia> listarPorFechaDeSensei(
            LocalDate fecha,
            String username) {
        return asistenciaRepository.findByFecha(fecha);
    }

    @Transactional(readOnly = true)
    public List<Asistencia> listarPorEstudianteYFecha(
            Long estudianteId,
            LocalDate fecha) {
        return asistenciaRepository.findByEstudianteIdAndFecha(estudianteId, fecha);
    }

    @Transactional(readOnly = true)
    public List<Asistencia> listarPorEstudianteYFechaDeSensei(
            Long estudianteId,
            LocalDate fecha,
            String username) {
        return asistenciaRepository.findByEstudianteIdAndFecha(estudianteId, fecha);
    }

    @Transactional(readOnly = true)
    public List<Asistencia> listarPorGrupoYFecha(
            Long grupoId,
            LocalDate fecha) {
        return asistenciaRepository.findByGrupoIdAndFecha(grupoId, fecha);
    }

    @Transactional(readOnly = true)
    public List<Asistencia> listarPorGrupoYFechaDeSensei(
            Long grupoId,
            LocalDate fecha,
            String username) {
        return asistenciaRepository.findByGrupoIdAndFecha(grupoId, fecha);
    }
}