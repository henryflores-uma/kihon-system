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
         * =========================================================
         * LISTAR ASIGNACIONES
         * =========================================================
         */

        public List<EstudianteGrupo> listarTodas() {
                return estudianteGrupoRepository.findAll();
        }

        public List<EstudianteGrupo> listarPorEstudiante(Long estudianteId) {
                return estudianteGrupoRepository.findByEstudianteId(estudianteId);
        }

        public List<EstudianteGrupo> listarPorGrupo(Long grupoId) {
                return estudianteGrupoRepository.findByGrupoId(grupoId);
        }

        public List<EstudianteGrupo> listarPorEstado(String estado) {
                return estudianteGrupoRepository.findByEstado(estado);
        }

        public List<EstudianteGrupo> listarActivasPorEstudiante(Long estudianteId) {
                return estudianteGrupoRepository.findByEstudianteIdAndEstado(
                                estudianteId,
                                "ACTIVO");
        }

        /*
         * =========================================================
         * BUSCAR ASIGNACIÓN
         * =========================================================
         */

        public EstudianteGrupo buscarPorId(Long id) {
                return estudianteGrupoRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException(
                                                "No se encontró la asignación estudiante-grupo"));
        }

        /*
         * =========================================================
         * CREAR ASIGNACIÓN
         * =========================================================
         */

        @Transactional
        public EstudianteGrupo asignarEstudianteAGrupo(
                        Long estudianteId,
                        Long grupoId) {

                Estudiante estudiante = estudianteRepository.findById(estudianteId)
                                .orElseThrow(() -> new RuntimeException(
                                                "No se encontró el estudiante"));

                Grupo grupo = grupoRepository.findById(grupoId)
                                .orElseThrow(() -> new RuntimeException(
                                                "No se encontró el grupo"));

                validarEstudianteActivo(estudiante);
                validarGrupoActivo(grupo);

                boolean yaAsignado = estudianteGrupoRepository
                                .existsByEstudianteIdAndGrupoIdAndEstado(
                                                estudianteId,
                                                grupoId,
                                                "ACTIVO");

                if (yaAsignado) {
                        throw new RuntimeException(
                                        "El estudiante ya está activo en este grupo");
                }

                validarCapacidadDisponible(grupo);

                EstudianteGrupo asignacion = new EstudianteGrupo();

                asignacion.setEstudiante(estudiante);
                asignacion.setGrupo(grupo);
                asignacion.setEstado("ACTIVO");

                return estudianteGrupoRepository.save(asignacion);
        }

        /*
         * =========================================================
         * MÉTODO COMPATIBILIDAD
         * =========================================================
         */

        @Transactional
        public EstudianteGrupo asignarEstudiante(
                        Long estudianteId,
                        Long grupoId) {

                return asignarEstudianteAGrupo(
                                estudianteId,
                                grupoId);
        }

        /*
         * =========================================================
         * CAMBIAR GRUPO
         * =========================================================
         */

        @Transactional
        public EstudianteGrupo cambiarGrupo(
                        Long asignacionId,
                        Long nuevoGrupoId) {

                EstudianteGrupo asignacion = estudianteGrupoRepository.findById(asignacionId)
                                .orElseThrow(() -> new RuntimeException(
                                                "No se encontró la asignación"));

                Grupo grupoActual = asignacion.getGrupo();

                Grupo nuevoGrupo = grupoRepository.findById(nuevoGrupoId)
                                .orElseThrow(() -> new RuntimeException(
                                                "No se encontró el nuevo grupo"));

                if (grupoActual != null
                                && grupoActual.getId().equals(nuevoGrupoId)) {

                        throw new RuntimeException(
                                        "El estudiante ya pertenece a este grupo");
                }

                validarEstudianteActivo(
                                asignacion.getEstudiante());

                validarGrupoActivo(nuevoGrupo);

                /*
                 * Solo comprobamos duplicidad si la asignación que
                 * estamos moviendo se encuentra activa.
                 */
                if ("ACTIVO".equalsIgnoreCase(
                                asignacion.getEstado())) {

                        boolean yaAsignado = estudianteGrupoRepository
                                        .existsByEstudianteIdAndGrupoIdAndEstado(
                                                        asignacion.getEstudiante().getId(),
                                                        nuevoGrupoId,
                                                        "ACTIVO");

                        if (yaAsignado) {
                                throw new RuntimeException(
                                                "El estudiante ya está activo en el nuevo grupo");
                        }

                        validarCapacidadDisponible(nuevoGrupo);
                }

                asignacion.setGrupo(nuevoGrupo);

                return estudianteGrupoRepository.save(asignacion);
        }

        /*
         * =========================================================
         * CAMBIAR ESTADO
         * =========================================================
         */

        @Transactional
        public EstudianteGrupo cambiarEstado(
                        Long id,
                        String estado) {

                EstudianteGrupo asignacion = estudianteGrupoRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException(
                                                "No se encontró la asignación"));

                if (estado == null ||
                                (!estado.equalsIgnoreCase("ACTIVO") &&
                                                !estado.equalsIgnoreCase("INACTIVO"))) {

                        throw new RuntimeException(
                                        "El estado debe ser ACTIVO o INACTIVO");
                }

                String nuevoEstado = estado.toUpperCase();

                /*
                 * Si se está activando la asignación,
                 * validamos estudiante, grupo, duplicidad y capacidad.
                 */
                if ("ACTIVO".equals(nuevoEstado)) {

                        Estudiante estudiante = asignacion.getEstudiante();
                        Grupo grupo = asignacion.getGrupo();

                        validarEstudianteActivo(estudiante);
                        validarGrupoActivo(grupo);

                        /*
                         * Si la asignación ya estaba activa, no es una nueva
                         * inscripción. Por lo tanto, no debemos bloquearla
                         * por duplicidad ni por capacidad.
                         */
                        boolean yaEstabaActiva = "ACTIVO".equalsIgnoreCase(
                                        asignacion.getEstado());

                        if (!yaEstabaActiva) {

                                /*
                                 * Buscamos otra asignación ACTIVA del mismo
                                 * estudiante en el mismo grupo, excluyendo
                                 * la asignación que estamos modificando.
                                 */
                                boolean otraAsignacionActiva = estudianteGrupoRepository
                                                .existsByEstudianteIdAndGrupoIdAndEstadoAndIdNot(
                                                                estudiante.getId(),
                                                                grupo.getId(),
                                                                "ACTIVO",
                                                                asignacion.getId());

                                if (otraAsignacionActiva) {
                                        throw new RuntimeException(
                                                        "El estudiante ya está activo en este grupo");
                                }

                                /*
                                 * Verificamos la capacidad únicamente cuando
                                 * realmente estamos activando una asignación
                                 * que estaba inactiva.
                                 */
                                validarCapacidadDisponible(grupo);
                        }
                }

                asignacion.setEstado(nuevoEstado);

                return estudianteGrupoRepository.save(asignacion);
        }

        /*
         * =========================================================
         * ELIMINAR ASIGNACIÓN
         * =========================================================
         */

        @Transactional
        public void eliminar(Long id) {

                EstudianteGrupo asignacion = estudianteGrupoRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException(
                                                "No se encontró la asignación"));

                estudianteGrupoRepository.delete(asignacion);
        }

        /*
         * =========================================================
         * VALIDAR ESTUDIANTE ACTIVO
         * =========================================================
         */

        private void validarEstudianteActivo(
                        Estudiante estudiante) {

                if (estudiante == null
                                || !"ACTIVO".equalsIgnoreCase(
                                                estudiante.getEstado())) {

                        throw new RuntimeException(
                                        "El estudiante no se encuentra activo");
                }
        }

        /*
         * =========================================================
         * VALIDAR GRUPO ACTIVO
         * =========================================================
         */

        private void validarGrupoActivo(
                        Grupo grupo) {

                if (grupo == null
                                || !"ACTIVO".equalsIgnoreCase(
                                                grupo.getEstado())) {

                        throw new RuntimeException(
                                        "El grupo no se encuentra activo");
                }
        }

        /*
         * =========================================================
         * VALIDAR CAPACIDAD
         * =========================================================
         */

        private void validarCapacidadDisponible(
                        Grupo grupo) {

                long estudiantesActivos = estudianteGrupoRepository
                                .countByGrupoIdAndEstado(
                                                grupo.getId(),
                                                "ACTIVO");

                if (estudiantesActivos >= grupo.getCapacidad()) {

                        throw new RuntimeException(
                                        "El grupo ha alcanzado su capacidad máxima");
                }
        }
}