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

        // ==========================================
        // REGISTRAR ASISTENCIA
        // ==========================================

        public Asistencia registrarAsistencia(
                        Long estudianteId,
                        Long grupoId,
                        LocalDate fecha,
                        LocalTime horaLlegada,
                        String estado,
                        String observacion) {

                Estudiante estudiante = estudianteRepository.findById(estudianteId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Estudiante no encontrado"));

                Grupo grupo = grupoRepository.findById(grupoId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Grupo no encontrado"));

                validarGrupoActivo(grupo);

                validarEstudianteActivoEnGrupo(
                                estudianteId,
                                grupoId);

                validarDatosAsistencia(
                                fecha,
                                horaLlegada,
                                estado);

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
                asistencia.setEstado(estado.toUpperCase());
                asistencia.setObservacion(observacion);

                return asistenciaRepository.save(asistencia);
        }

        // ==========================================
        // ACTUALIZAR ASISTENCIA
        // ==========================================

        public Asistencia actualizarAsistencia(
                        Long id,
                        Long estudianteId,
                        Long grupoId,
                        LocalDate fecha,
                        LocalTime horaLlegada,
                        String estado,
                        String observacion) {

                Asistencia asistencia = asistenciaRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException(
                                                "Asistencia no encontrada"));

                Estudiante estudiante = estudianteRepository.findById(estudianteId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Estudiante no encontrado"));

                Grupo grupo = grupoRepository.findById(grupoId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Grupo no encontrado"));

                validarGrupoActivo(grupo);

                validarEstudianteActivoEnGrupo(
                                estudianteId,
                                grupoId);

                validarDatosAsistencia(
                                fecha,
                                horaLlegada,
                                estado);

                /*
                 * Si se está cambiando estudiante, grupo o fecha,
                 * verificamos que no exista otra asistencia con
                 * esa misma combinación.
                 */
                boolean cambioRegistro = !asistencia.getEstudiante().getId().equals(estudianteId)
                                || !asistencia.getGrupo().getId().equals(grupoId)
                                || !asistencia.getFecha().equals(fecha);

                if (cambioRegistro
                                && asistenciaRepository
                                                .existsByEstudianteIdAndGrupoIdAndFecha(
                                                                estudianteId,
                                                                grupoId,
                                                                fecha)) {

                        throw new RuntimeException(
                                        "Ya existe otra asistencia para este estudiante, grupo y fecha");
                }

                asistencia.setEstudiante(estudiante);
                asistencia.setGrupo(grupo);
                asistencia.setFecha(fecha);
                asistencia.setHoraLlegada(horaLlegada);
                asistencia.setEstado(estado.toUpperCase());
                asistencia.setObservacion(observacion);

                return asistenciaRepository.save(asistencia);
        }

        // ==========================================
        // LISTAR POR ESTUDIANTE
        // ==========================================

        public List<Asistencia> listarPorEstudiante(Long estudianteId) {

                return asistenciaRepository.findByEstudianteId(estudianteId);
        }

        // ==========================================
        // LISTAR POR GRUPO
        // ==========================================

        public List<Asistencia> listarPorGrupo(Long grupoId) {

                return asistenciaRepository.findByGrupoId(grupoId);
        }

        // ==========================================
        // LISTAR POR FECHA
        // ==========================================

        public List<Asistencia> listarPorFecha(LocalDate fecha) {

                return asistenciaRepository.findByFecha(fecha);
        }

        // ==========================================
        // LISTAR POR ESTUDIANTE Y FECHA
        // ==========================================

        public List<Asistencia> listarPorEstudianteYFecha(
                        Long estudianteId,
                        LocalDate fecha) {

                return asistenciaRepository
                                .findByEstudianteIdAndFecha(
                                                estudianteId,
                                                fecha);
        }

        // ==========================================
        // LISTAR POR GRUPO Y FECHA
        // ==========================================

        public List<Asistencia> listarPorGrupoYFecha(
                        Long grupoId,
                        LocalDate fecha) {

                return asistenciaRepository
                                .findByGrupoIdAndFecha(
                                                grupoId,
                                                fecha);
        }

        // ==========================================
        // VALIDAR GRUPO
        // ==========================================

        private void validarGrupoActivo(Grupo grupo) {

                if (!"ACTIVO".equalsIgnoreCase(grupo.getEstado())) {

                        throw new RuntimeException(
                                        "No se puede registrar asistencia en un grupo inactivo");
                }
        }

        // ==========================================
        // VALIDAR ESTUDIANTE EN GRUPO
        // ==========================================

        private void validarEstudianteActivoEnGrupo(
                        Long estudianteId,
                        Long grupoId) {

                if (!estudianteGrupoRepository
                                .existsByEstudianteIdAndGrupoIdAndEstado(
                                                estudianteId,
                                                grupoId,
                                                "ACTIVO")) {

                        throw new RuntimeException(
                                        "El estudiante no está asignado activamente a este grupo");
                }
        }

        // ==========================================
        // VALIDAR DATOS DE ASISTENCIA
        // ==========================================

        private void validarDatosAsistencia(
                        LocalDate fecha,
                        LocalTime horaLlegada,
                        String estado) {

                if (fecha == null) {

                        throw new RuntimeException(
                                        "La fecha es obligatoria");
                }

                if (estado == null || estado.isBlank()) {

                        throw new RuntimeException(
                                        "El estado de la asistencia es obligatorio");
                }

                String estadoNormalizado = estado.toUpperCase();

                if (!estadoNormalizado.equals("PRESENTE")
                                && !estadoNormalizado.equals("AUSENTE")
                                && !estadoNormalizado.equals("TARDANZA")) {

                        throw new RuntimeException(
                                        "El estado debe ser PRESENTE, AUSENTE o TARDANZA");
                }

                if (estadoNormalizado.equals("PRESENTE")
                                || estadoNormalizado.equals("TARDANZA")) {

                        if (horaLlegada == null) {

                                throw new RuntimeException(
                                                "La hora de llegada es obligatoria para PRESENTE o TARDANZA");
                        }
                }

                if (estadoNormalizado.equals("AUSENTE")
                                && horaLlegada != null) {

                        throw new RuntimeException(
                                        "Un estudiante AUSENTE no debe tener hora de llegada");
                }
        }
}