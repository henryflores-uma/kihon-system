package com.kihon.kihon.service;

import com.kihon.kihon.model.Estudiante;
import com.kihon.kihon.model.EstudianteGrupo;
import com.kihon.kihon.model.Grupo;
import com.kihon.kihon.repository.EstudianteGrupoRepository;
import com.kihon.kihon.repository.EstudianteRepository;
import com.kihon.kihon.repository.GrupoRepository;
import org.springframework.stereotype.Service;

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
                // UN SOLO GRUPO ACTIVO POR ESTUDIANTE
                // ==========================================

                List<EstudianteGrupo> asignacionesActivas = estudianteGrupoRepository
                                .findByEstudianteIdAndEstado(
                                                estudianteId,
                                                "ACTIVO");

                if (!asignacionesActivas.isEmpty()) {

                        throw new RuntimeException(
                                        "El estudiante ya tiene un grupo activo. " +
                                                        "Debe cambiar de grupo desde la opción 'Cambiar grupo'.");
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
         */

        public EstudianteGrupo cambiarGrupo(
                        Long estudianteId,
                        Long nuevoGrupoId) {

                Estudiante estudiante = estudianteRepository.findById(estudianteId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Estudiante no encontrado"));

                Grupo nuevoGrupo = grupoRepository.findById(nuevoGrupoId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Grupo no encontrado"));

                if (!"ACTIVO".equalsIgnoreCase(
                                estudiante.getEstado())) {

                        throw new RuntimeException(
                                        "No se puede cambiar de grupo a un estudiante inactivo");
                }

                if (!"ACTIVO".equalsIgnoreCase(
                                nuevoGrupo.getEstado())) {

                        throw new RuntimeException(
                                        "No se puede cambiar a un grupo inactivo");
                }

                List<EstudianteGrupo> asignacionesActivas = estudianteGrupoRepository
                                .findByEstudianteIdAndEstado(
                                                estudianteId,
                                                "ACTIVO");

                boolean yaEstaEnNuevoGrupo = asignacionesActivas
                                .stream()
                                .anyMatch(asignacion -> asignacion
                                                .getGrupo()
                                                .getId()
                                                .equals(nuevoGrupoId));

                if (yaEstaEnNuevoGrupo) {

                        throw new RuntimeException(
                                        "El estudiante ya está activo en este grupo");
                }

                long estudiantesActivos = estudianteGrupoRepository
                                .countByGrupoIdAndEstado(
                                                nuevoGrupoId,
                                                "ACTIVO");

                if (estudiantesActivos >= nuevoGrupo.getCapacidad()) {

                        throw new RuntimeException(
                                        "El nuevo grupo ha alcanzado su capacidad máxima");
                }

                /*
                 * Un estudiante solo puede tener
                 * un grupo activo a la vez.
                 */
                for (EstudianteGrupo asignacion : asignacionesActivas) {

                        asignacion.setEstado("INACTIVO");

                        estudianteGrupoRepository.save(
                                        asignacion);
                }

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

                asignacion.setEstado(
                                estado.toUpperCase());

                return estudianteGrupoRepository.save(
                                asignacion);
        }
}