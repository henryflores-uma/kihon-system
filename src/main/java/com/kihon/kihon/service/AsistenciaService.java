
package com.kihon.kihon.service;

import com.kihon.kihon.model.Asistencia;
import com.kihon.kihon.model.Estudiante;
import com.kihon.kihon.model.Grupo;
import com.kihon.kihon.model.Usuario;

import com.kihon.kihon.repository.AsistenciaRepository;
import com.kihon.kihon.repository.EstudianteGrupoRepository;
import com.kihon.kihon.repository.EstudianteRepository;
import com.kihon.kihon.repository.GrupoRepository;
import com.kihon.kihon.repository.UsuarioRepository;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import java.util.HashSet;

@Service
public class AsistenciaService {

        private final AsistenciaRepository asistenciaRepository;
        private final EstudianteRepository estudianteRepository;
        private final GrupoRepository grupoRepository;
        private final EstudianteGrupoRepository estudianteGrupoRepository;
        private final UsuarioRepository usuarioRepository;

        public AsistenciaService(
                        AsistenciaRepository asistenciaRepository,
                        EstudianteRepository estudianteRepository,
                        GrupoRepository grupoRepository,
                        EstudianteGrupoRepository estudianteGrupoRepository,
                        UsuarioRepository usuarioRepository) {

                this.asistenciaRepository = asistenciaRepository;
                this.estudianteRepository = estudianteRepository;
                this.grupoRepository = grupoRepository;
                this.estudianteGrupoRepository = estudianteGrupoRepository;
                this.usuarioRepository = usuarioRepository;
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
                                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));

                Grupo grupo = grupoRepository.findById(grupoId)
                                .orElseThrow(() -> new RuntimeException("Grupo no encontrado"));

                validarEstudianteActivo(estudiante);
                validarGrupoActivo(grupo);

                validarEstudianteActivoEnGrupo(estudianteId, grupoId);

                validarDatosAsistencia(fecha, horaLlegada, estado);

                if (asistenciaRepository.existsByEstudianteIdAndGrupoIdAndFecha(
                                estudianteId, grupoId, fecha)) {

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
        // REGISTRAR ASISTENCIA - SENSEI
        // ==========================================

        @Transactional
        public Asistencia registrarAsistenciaDeSensei(
                        Long estudianteId,
                        Long grupoId,
                        LocalDate fecha,
                        LocalTime horaLlegada,
                        String estado,
                        String observacion,
                        String username) {

                // Verificar que el grupo pertenezca al Sensei.
                validarGrupoDelSensei(grupoId, username);

                // El método original conserva las validaciones
                // de estudiante activo, grupo activo e inscripción.
                return registrarAsistencia(
                                estudianteId,
                                grupoId,
                                fecha,
                                horaLlegada,
                                estado,
                                observacion);
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
                                .orElseThrow(() -> new RuntimeException("Asistencia no encontrada"));

                Estudiante estudiante = estudianteRepository.findById(estudianteId)
                                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));

                Grupo grupo = grupoRepository.findById(grupoId)
                                .orElseThrow(() -> new RuntimeException("Grupo no encontrado"));

                validarDatosAsistencia(fecha, horaLlegada, estado);

                boolean cambioRegistro = !asistencia.getEstudiante().getId().equals(estudianteId)
                                || !asistencia.getGrupo().getId().equals(grupoId)
                                || !asistencia.getFecha().equals(fecha);

                if (cambioRegistro
                                && asistenciaRepository.existsByEstudianteIdAndGrupoIdAndFecha(
                                                estudianteId, grupoId, fecha)) {

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
        // ACTUALIZAR ASISTENCIA - SENSEI
        // ==========================================

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

                Asistencia asistencia = asistenciaRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Asistencia no encontrada"));

                // No permitir modificar una asistencia de otro Sensei.
                validarGrupoDelSensei(
                                asistencia.getGrupo().getId(),
                                username);

                // El grupo de destino también debe pertenecer al Sensei.
                validarGrupoDelSensei(grupoId, username);

                boolean cambioEstudianteOGrupo = !asistencia.getEstudiante().getId().equals(estudianteId)
                                || !asistencia.getGrupo().getId().equals(grupoId);

                // Si cambia el estudiante o el grupo, debe existir
                // una inscripción activa en el grupo de destino.
                if (cambioEstudianteOGrupo) {
                        validarEstudianteActivoEnGrupo(estudianteId, grupoId);
                }

                return actualizarAsistencia(
                                id,
                                estudianteId,
                                grupoId,
                                fecha,
                                horaLlegada,
                                estado,
                                observacion);
        }

        // ==========================================
        // LISTAR POR ESTUDIANTE
        // ==========================================

        public List<Asistencia> listarPorEstudiante(Long estudianteId) {
                return asistenciaRepository.findByEstudianteId(estudianteId);
        }

        // ==========================================
        // LISTAR POR ESTUDIANTE - SENSEI
        // ==========================================

        @Transactional(readOnly = true)
        public List<Asistencia> listarPorEstudianteDeSensei(
                        Long estudianteId,
                        String username) {

                Set<Long> gruposIds = obtenerIdsGruposDelSensei(username);

                return asistenciaRepository.findByEstudianteId(estudianteId)
                                .stream()
                                .filter(a -> gruposIds.contains(a.getGrupo().getId()))
                                .toList();
        }

        // ==========================================
        // LISTAR POR GRUPO
        // ==========================================

        public List<Asistencia> listarPorGrupo(Long grupoId) {
                return asistenciaRepository.findByGrupoId(grupoId);
        }

        // ==========================================
        // LISTAR POR GRUPO - SENSEI
        // ==========================================

        @Transactional(readOnly = true)
        public List<Asistencia> listarPorGrupoDeSensei(
                        Long grupoId,
                        String username) {

                validarGrupoDelSensei(grupoId, username);

                return asistenciaRepository.findByGrupoId(grupoId);
        }

        // ==========================================
        // LISTAR POR FECHA
        // ==========================================

        public List<Asistencia> listarPorFecha(LocalDate fecha) {
                return asistenciaRepository.findByFecha(fecha);
        }

        // ==========================================
        // LISTAR POR FECHA - SENSEI
        // ==========================================

        @Transactional(readOnly = true)
        public List<Asistencia> listarPorFechaDeSensei(
                        LocalDate fecha,
                        String username) {

                Set<Long> gruposIds = obtenerIdsGruposDelSensei(username);

                return asistenciaRepository.findByFecha(fecha)
                                .stream()
                                .filter(a -> gruposIds.contains(a.getGrupo().getId()))
                                .toList();
        }

        // ==========================================
        // ESTUDIANTE + FECHA
        // ==========================================

        public List<Asistencia> listarPorEstudianteYFecha(
                        Long estudianteId,
                        LocalDate fecha) {

                return asistenciaRepository.findByEstudianteIdAndFecha(
                                estudianteId,
                                fecha);
        }

        // ==========================================
        // ESTUDIANTE + FECHA - SENSEI
        // ==========================================

        @Transactional(readOnly = true)
        public List<Asistencia> listarPorEstudianteYFechaDeSensei(
                        Long estudianteId,
                        LocalDate fecha,
                        String username) {

                Set<Long> gruposIds = obtenerIdsGruposDelSensei(username);

                return asistenciaRepository.findByEstudianteIdAndFecha(
                                estudianteId,
                                fecha)
                                .stream()
                                .filter(a -> gruposIds.contains(a.getGrupo().getId()))
                                .toList();
        }

        // ==========================================
        // GRUPO + FECHA
        // ==========================================

        public List<Asistencia> listarPorGrupoYFecha(
                        Long grupoId,
                        LocalDate fecha) {

                return asistenciaRepository.findByGrupoIdAndFecha(
                                grupoId,
                                fecha);
        }

        // ==========================================
        // GRUPO + FECHA - SENSEI
        // ==========================================

        @Transactional(readOnly = true)
        public List<Asistencia> listarPorGrupoYFechaDeSensei(
                        Long grupoId,
                        LocalDate fecha,
                        String username) {

                validarGrupoDelSensei(grupoId, username);

                return asistenciaRepository.findByGrupoIdAndFecha(
                                grupoId,
                                fecha);
        }

        // ==========================================
        // OBTENER SENSEI AUTENTICADO
        // ==========================================

        private Usuario obtenerSenseiAutenticado(String username) {

                Usuario sensei = usuarioRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException(
                                                "Usuario autenticado no encontrado"));

                if (sensei.getRol() == null
                                || !"SENSEI".equalsIgnoreCase(sensei.getRol().getNombre())) {

                        throw new AccessDeniedException(
                                        "El usuario autenticado no tiene el rol SENSEI");
                }

                if (!"ACTIVO".equalsIgnoreCase(sensei.getEstado())) {
                        throw new AccessDeniedException(
                                        "El Sensei no se encuentra activo");
                }

                return sensei;
        }

        // ==========================================
        // OBTENER GRUPOS DEL SENSEI
        // ==========================================

        private Set<Long> obtenerIdsGruposDelSensei(String username) {

                Usuario sensei = obtenerSenseiAutenticado(username);

                List<Grupo> grupos = grupoRepository.findBySenseiId(sensei.getId());

                Set<Long> gruposIds = new HashSet<>();

                if (grupos == null || grupos.isEmpty()) {
                        return gruposIds;
                }

                for (Grupo grupo : grupos) {

                        if (grupo != null && grupo.getId() != null) {
                                gruposIds.add(grupo.getId());
                        }
                }

                return gruposIds;
        }
        // ==========================================
        // VALIDAR PROPIEDAD DEL GRUPO
        // ==========================================

        private void validarGrupoDelSensei(
                        Long grupoId,
                        String username) {

                Usuario sensei = obtenerSenseiAutenticado(username);

                Grupo grupo = grupoRepository.findById(grupoId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Grupo no encontrado"));

                if (grupo.getSensei() == null
                                || !grupo.getSensei().getId().equals(sensei.getId())) {

                        throw new AccessDeniedException(
                                        "No tienes autorización para acceder a este grupo");
                }
        }

        // ==========================================
        // VALIDAR ESTUDIANTE ACTIVO
        // ==========================================

        private void validarEstudianteActivo(Estudiante estudiante) {

                if (!"ACTIVO".equalsIgnoreCase(estudiante.getEstado())) {
                        throw new RuntimeException(
                                        "No se puede registrar asistencia para un estudiante inactivo");
                }
        }

        // ==========================================
        // VALIDAR GRUPO ACTIVO
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
                        throw new RuntimeException("La fecha es obligatoria");
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

        @Transactional(readOnly = true)
        public List<Asistencia> listarUltimasPorEstudiante(Long estudianteId) {

                return asistenciaRepository
                                .findTop5ByEstudianteIdOrderByFechaDescIdDesc(estudianteId);
        }
}
