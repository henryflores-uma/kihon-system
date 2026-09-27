package com.kihon.kihon.service;

import com.kihon.kihon.model.Estudiante;
import com.kihon.kihon.model.EstudianteGrupo;
import com.kihon.kihon.model.Grupo;
import com.kihon.kihon.repository.EstudianteGrupoRepository;
import com.kihon.kihon.repository.EstudianteRepository;
import com.kihon.kihon.repository.GrupoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EstudianteGrupoService {

        private final EstudianteGrupoRepository estudianteGrupoRepository;
        private final EstudianteRepository estudianteRepository;
        private final GrupoRepository grupoRepository;

        public EstudianteGrupoService(
                        EstudianteGrupoRepository estudianteGrupoRepository,
                        EstudianteRepository estudianteRepository,
                        GrupoRepository grupoRepository) {

                this.estudianteGrupoRepository = estudianteGrupoRepository;
                this.estudianteRepository = estudianteRepository;
                this.grupoRepository = grupoRepository;
        }

        /*
         * ================================
         * ASIGNAR ESTUDIANTE A GRUPO
         * =================================
         */

        @Transactional
        public EstudianteGrupo asignarEstudianteAGrupo(
                        Long estudianteId,
                        Long grupoId) {

                Estudiante estudiante = estudianteRepository.findById(estudianteId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Estudiante no encontrado"));

                Grupo grupo = grupoRepository.findById(grupoId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Grupo no encontrado"));

                if (!"ACTIVO".equalsIgnoreCase(
                                estudiante.getEstado())) {

                        throw new RuntimeException(
                                        "No se puede asignar un estudiante inactivo");
                }

                if (!"ACTIVO".equalsIgnoreCase(
                                grupo.getEstado())) {

                        throw new RuntimeException(
                                        "No se puede asignar un estudiante a un grupo inactivo");
                }

                // ==========================================
                // EVITAR DUPLICAR ASIGNACIÓN
                // ==========================================

                boolean yaAsignado = estudianteGrupoRepository
                                .existsByEstudianteIdAndGrupoIdAndEstado(
                                                estudianteId,
                                                grupoId,
                                                "ACTIVO");

                if (yaAsignado) {

                        throw new RuntimeException(
                                        "El estudiante ya está activo en este grupo");
                }

                // ==========================================
                // VALIDAR CAPACIDAD
                // ==========================================

                long estudiantesActivos = estudianteGrupoRepository
                                .countByGrupoIdAndEstado(
                                                grupoId,
                                                "ACTIVO");

                if (estudiantesActivos >= grupo.getCapacidad()) {

                        throw new RuntimeException(
                                        "El grupo ha alcanzado su capacidad máxima");
                }

                // ==========================================
                // CREAR ASIGNACIÓN
                // ==========================================

                EstudianteGrupo estudianteGrupo = new EstudianteGrupo();

                estudianteGrupo.setEstudiante(estudiante);
                estudianteGrupo.setGrupo(grupo);
                estudianteGrupo.setEstado("ACTIVO");

                return estudianteGrupoRepository.save(
                                estudianteGrupo);
        }

        /*
         * ================================
         * LISTAR TODAS LAS ASIGNACIONES
         * =================================
         */

        public List<EstudianteGrupo> listarTodas() {

                return estudianteGrupoRepository.findAll();
        }

        /*
         * ================================
         * LISTAR POR ESTUDIANTE
         * =================================
         */

        public List<EstudianteGrupo> listarPorEstudiante(
                        Long estudianteId) {

                if (!estudianteRepository.existsById(estudianteId)) {

                        throw new RuntimeException(
                                        "Estudiante no encontrado");
                }

                return estudianteGrupoRepository
                                .findByEstudianteId(estudianteId);
        }

        /*
         * ================================
         * LISTAR POR GRUPO
         * =================================
         */

        public List<EstudianteGrupo> listarPorGrupo(
                        Long grupoId) {

                if (!grupoRepository.existsById(grupoId)) {

                        throw new RuntimeException(
                                        "Grupo no encontrado");
                }

                return estudianteGrupoRepository
                                .findByGrupoId(grupoId);
        }

        /*
         * ================================
         * CAMBIAR GRUPO
         * =================================
         *
         * IMPORTANTE:
         * Este método cambia una asignación específica.
         *
         * No se deben desactivar todos los grupos
         * activos del estudiante porque un estudiante
         * puede pertenecer a varios grupos.
         */

        @Transactional
        public EstudianteGrupo cambiarGrupo(
                        Long asignacionId,
                        Long nuevoGrupoId) {

                EstudianteGrupo asignacion = estudianteGrupoRepository.findById(asignacionId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Asignación no encontrada"));

                Estudiante estudiante = asignacion.getEstudiante();

                Grupo nuevoGrupo = grupoRepository.findById(nuevoGrupoId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Grupo no encontrado"));

                // ==========================================
                // VALIDAR ESTUDIANTE
                // ==========================================

                if (!"ACTIVO".equalsIgnoreCase(
                                estudiante.getEstado())) {

                        throw new RuntimeException(
                                        "No se puede cambiar de grupo a un estudiante inactivo");
                }

                // ==========================================
                // VALIDAR GRUPO NUEVO
                // ==========================================

                if (!"ACTIVO".equalsIgnoreCase(
                                nuevoGrupo.getEstado())) {

                        throw new RuntimeException(
                                        "No se puede cambiar a un grupo inactivo");
                }

                // ==========================================
                // EVITAR CAMBIAR AL MISMO GRUPO
                // ==========================================

                if (asignacion.getGrupo()
                                .getId()
                                .equals(nuevoGrupoId)) {

                        throw new RuntimeException(
                                        "El estudiante ya pertenece a este grupo");
                }

                // ==========================================
                // VERIFICAR SI YA TIENE EL NUEVO GRUPO
                // ==========================================

                boolean yaPerteneceAlNuevoGrupo = estudianteGrupoRepository
                                .existsByEstudianteIdAndGrupoIdAndEstado(
                                                estudiante.getId(),
                                                nuevoGrupoId,
                                                "ACTIVO");

                if (yaPerteneceAlNuevoGrupo) {

                        throw new RuntimeException(
                                        "El estudiante ya está activo en el nuevo grupo");
                }

                // ==========================================
                // VALIDAR CAPACIDAD
                // ==========================================

                long estudiantesActivos = estudianteGrupoRepository
                                .countByGrupoIdAndEstado(
                                                nuevoGrupoId,
                                                "ACTIVO");

                if (estudiantesActivos >= nuevoGrupo.getCapacidad()) {

                        throw new RuntimeException(
                                        "El nuevo grupo ha alcanzado su capacidad máxima");
                }

                // ==========================================
                // DESACTIVAR ASIGNACIÓN ACTUAL
                // ==========================================

                asignacion.setEstado("INACTIVO");

                estudianteGrupoRepository.save(
                                asignacion);

                // ==========================================
                // CREAR NUEVA ASIGNACIÓN
                // ==========================================

                EstudianteGrupo nuevaAsignacion = new EstudianteGrupo();

                nuevaAsignacion.setEstudiante(estudiante);
                nuevaAsignacion.setGrupo(nuevoGrupo);
                nuevaAsignacion.setEstado("ACTIVO");

                return estudianteGrupoRepository.save(
                                nuevaAsignacion);
        }

        /*
         * ================================
         * CAMBIAR ESTADO DE ASIGNACIÓN
         * =================================
         */

        @Transactional
        public EstudianteGrupo cambiarEstado(
                        Long id,
                        String estado) {

                EstudianteGrupo asignacion = estudianteGrupoRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException(
                                                "Asignación no encontrada"));

                if (estado == null ||
                                (!estado.equalsIgnoreCase("ACTIVO") &&
                                                !estado.equalsIgnoreCase("INACTIVO"))) {

                        throw new RuntimeException(
                                        "El estado debe ser ACTIVO o INACTIVO");
                }

                String nuevoEstado = estado.toUpperCase();

                // ==========================================
                // SI SE ACTIVA LA ASIGNACIÓN
                // ==========================================

                if ("ACTIVO".equals(nuevoEstado)) {

                        Estudiante estudiante = asignacion.getEstudiante();

                        Grupo grupo = asignacion.getGrupo();

                        // ==========================================
                        // VALIDAR ESTUDIANTE
                        // ==========================================

                        if (!"ACTIVO".equalsIgnoreCase(
                                        estudiante.getEstado())) {

                                throw new RuntimeException(
                                                "No se puede activar la asignación de un estudiante inactivo");
                        }

                        // ==========================================
                        // VALIDAR GRUPO
                        // ==========================================

                        if (!"ACTIVO".equalsIgnoreCase(
                                        grupo.getEstado())) {

                                throw new RuntimeException(
                                                "No se puede activar una asignación de un grupo inactivo");
                        }

                        // ==========================================
                        // VERIFICAR QUE NO ESTÉ YA ACTIVO
                        // ==========================================

                        boolean otraAsignacionActiva = estudianteGrupoRepository
                                        .existsByEstudianteIdAndGrupoIdAndEstado(
                                                        estudiante.getId(),
                                                        grupo.getId(),
                                                        "ACTIVO");

                        if (otraAsignacionActiva) {

                                throw new RuntimeException(
                                                "El estudiante ya está activo en este grupo");
                        }

                        // ==========================================
                        // VERIFICAR CAPACIDAD
                        // ==========================================

                        long estudiantesActivos = estudianteGrupoRepository
                                        .countByGrupoIdAndEstado(
                                                        grupo.getId(),
                                                        "ACTIVO");

                        if (estudiantesActivos >= grupo.getCapacidad()) {

                                throw new RuntimeException(
                                                "El grupo ha alcanzado su capacidad máxima");
                        }
                }

                asignacion.setEstado(nuevoEstado);

                return estudianteGrupoRepository.save(
                                asignacion);
        }
}