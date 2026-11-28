
package com.kihon.kihon.service;

import com.kihon.kihon.dto.AsistenciaPageResponse;
import com.kihon.kihon.model.Asistencia;
import com.kihon.kihon.model.Estudiante;
import com.kihon.kihon.model.Grupo;
import com.kihon.kihon.model.Usuario;

import com.kihon.kihon.repository.AsistenciaRepository;
import com.kihon.kihon.repository.EstudianteGrupoRepository;
import com.kihon.kihon.repository.EstudianteRepository;
import com.kihon.kihon.repository.GrupoRepository;
import com.kihon.kihon.repository.UsuarioRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

        // =========================================================
        // PAGINACIÓN Y RESUMEN PARA ESTUDIANTE
        // =========================================================

        @Transactional(readOnly = true)
        public Page<Asistencia> listarPorEstudiantePaginado(
                        Long estudianteId,
                        String estado,
                        Pageable pageable) {

                if (estado != null
                                && !estado.isBlank()
                                && !"TODOS".equalsIgnoreCase(estado)) {

                        return asistenciaRepository
                                        .findByEstudianteIdAndEstadoIgnoreCaseOrderByFechaDescIdDesc(
                                                        estudianteId,
                                                        estado.trim(),
                                                        pageable);
                }

                return asistenciaRepository
                                .findByEstudianteIdOrderByFechaDescIdDesc(
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
        // REGISTRAR ASISTENCIA
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

                validarEstudianteActivo(estudiante);
                validarGrupoActivo(grupo);
                validarEstudianteActivoEnGrupo(estudianteId, grupoId);

                // Se mantienen los valores predeterminados del segundo código.
                LocalDate fechaFinal = fecha != null
                                ? fecha
                                : LocalDate.now();

                String estadoFinal = estado != null && !estado.isBlank()
                                ? estado.trim().toUpperCase()
                                : "PRESENTE";

                validarDatosAsistencia(fechaFinal, horaLlegada, estadoFinal);

                if (asistenciaRepository.existsByEstudianteIdAndGrupoIdAndFecha(
                                estudianteId, grupoId, fechaFinal)) {

                        throw new RuntimeException(
                                        "El estudiante ya tiene asistencia registrada para este grupo en esta fecha");
                }

                Asistencia asistencia = new Asistencia();

                asistencia.setEstudiante(estudiante);
                asistencia.setGrupo(grupo);
                asistencia.setFecha(fechaFinal);
                asistencia.setHoraLlegada(horaLlegada);
                asistencia.setEstado(estadoFinal);
                asistencia.setObservacion(observacion);

                return asistenciaRepository.save(asistencia);
        }

        // =========================================================
        // REGISTRAR ASISTENCIA - SENSEI
        // =========================================================

        @Transactional
        public Asistencia registrarAsistenciaDeSensei(
                        Long estudianteId,
                        Long grupoId,
                        LocalDate fecha,
                        LocalTime horaLlegada,
                        String estado,
                        String observacion,
                        String username) {

                validarGrupoDelSensei(grupoId, username);

                return registrarAsistencia(
                                estudianteId,
                                grupoId,
                                fecha,
                                horaLlegada,
                                estado,
                                observacion);
        }

        // =========================================================
        // ACTUALIZAR ASISTENCIA
        // =========================================================

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

                // Se permite actualización parcial.
                Estudiante estudiante = asistencia.getEstudiante();
                Grupo grupo = asistencia.getGrupo();

                if (estudianteId != null) {
                        estudiante = estudianteRepository.findById(estudianteId)
                                        .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));
                }

                if (grupoId != null) {
                        grupo = grupoRepository.findById(grupoId)
                                        .orElseThrow(() -> new RuntimeException("Grupo no encontrado"));
                }

                LocalDate fechaFinal = fecha != null
                                ? fecha
                                : asistencia.getFecha();

                String estadoFinal = estado != null && !estado.isBlank()
                                ? estado.trim().toUpperCase()
                                : asistencia.getEstado();

                validarDatosAsistencia(
                                fechaFinal,
                                horaLlegada,
                                estadoFinal);

                boolean cambioRegistro = !asistencia.getEstudiante().getId().equals(estudiante.getId())
                                || !asistencia.getGrupo().getId().equals(grupo.getId())
                                || !asistencia.getFecha().equals(fechaFinal);

                if (cambioRegistro
                                && asistenciaRepository.existsByEstudianteIdAndGrupoIdAndFecha(
                                                estudiante.getId(),
                                                grupo.getId(),
                                                fechaFinal)) {

                        throw new RuntimeException(
                                        "Ya existe otra asistencia para este estudiante, grupo y fecha");
                }

                // Validar estudiante y grupo cuando se modifica la relación.
                if (!asistencia.getEstudiante().getId().equals(estudiante.getId())) {
                        validarEstudianteActivo(estudiante);
                }

                if (!asistencia.getGrupo().getId().equals(grupo.getId())) {
                        validarGrupoActivo(grupo);
                }

                if (!asistencia.getEstudiante().getId().equals(estudiante.getId())
                                || !asistencia.getGrupo().getId().equals(grupo.getId())) {

                        validarEstudianteActivoEnGrupo(
                                        estudiante.getId(),
                                        grupo.getId());
                }

                asistencia.setEstudiante(estudiante);
                asistencia.setGrupo(grupo);
                asistencia.setFecha(fechaFinal);
                asistencia.setHoraLlegada(horaLlegada);
                asistencia.setEstado(estadoFinal);
                asistencia.setObservacion(observacion);

                return asistenciaRepository.save(asistencia);
        }

        // =========================================================
        // ACTUALIZAR ASISTENCIA - SENSEI
        // =========================================================

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

                // El Sensei debe ser propietario del grupo original.
                validarGrupoDelSensei(
                                asistencia.getGrupo().getId(),
                                username);

                // El grupo de destino también debe pertenecer al Sensei.
                if (grupoId != null) {
                        validarGrupoDelSensei(grupoId, username);
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

        // =========================================================
        // LISTAR POR ESTUDIANTE
        // =========================================================

        @Transactional(readOnly = true)
        public List<Asistencia> listarPorEstudiante(Long estudianteId) {
                return asistenciaRepository.findByEstudianteId(estudianteId);
        }

        // =========================================================
        // LISTAR POR ESTUDIANTE - SENSEI
        // =========================================================

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

        // =========================================================
        // LISTAR ÚLTIMAS ASISTENCIAS
        // =========================================================

        @Transactional(readOnly = true)
        public List<Asistencia> listarUltimasPorEstudiante(Long estudianteId) {

                return asistenciaRepository
                                .findTop5ByEstudianteIdOrderByFechaDescIdDesc(estudianteId);
        }

        // =========================================================
        // LISTAR POR GRUPO
        // =========================================================

        @Transactional(readOnly = true)
        public List<Asistencia> listarPorGrupo(Long grupoId) {
                return asistenciaRepository.findByGrupoId(grupoId);
        }

        // =========================================================
        // LISTAR POR GRUPO - SENSEI
        // =========================================================

        @Transactional(readOnly = true)
        public List<Asistencia> listarPorGrupoDeSensei(
                        Long grupoId,
                        String username) {

                validarGrupoDelSensei(grupoId, username);

                return asistenciaRepository.findByGrupoId(grupoId);
        }

        // =========================================================
        // LISTAR POR FECHA
        // =========================================================

        @Transactional(readOnly = true)
        public List<Asistencia> listarPorFecha(LocalDate fecha) {
                return asistenciaRepository.findByFecha(fecha);
        }

        // =========================================================
        // LISTAR POR FECHA - SENSEI
        // =========================================================

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

        // =========================================================
        // ESTUDIANTE + FECHA
        // =========================================================

        @Transactional(readOnly = true)
        public List<Asistencia> listarPorEstudianteYFecha(
                        Long estudianteId,
                        LocalDate fecha) {

                return asistenciaRepository.findByEstudianteIdAndFecha(
                                estudianteId,
                                fecha);
        }

        // =========================================================
        // ESTUDIANTE + FECHA - SENSEI
        // =========================================================

        @Transactional(readOnly = true)
        public List<Asistencia> listarPorEstudianteYFechaDeSensei(
                        Long estudianteId,
                        LocalDate fecha,
                        String username) {

                Set<Long> gruposIds = obtenerIdsGruposDelSensei(username);

                return asistenciaRepository
                                .findByEstudianteIdAndFecha(estudianteId, fecha)
                                .stream()
                                .filter(a -> gruposIds.contains(a.getGrupo().getId()))
                                .toList();
        }

        // =========================================================
        // GRUPO + FECHA
        // =========================================================

        @Transactional(readOnly = true)
        public List<Asistencia> listarPorGrupoYFecha(
                        Long grupoId,
                        LocalDate fecha) {

                return asistenciaRepository.findByGrupoIdAndFecha(
                                grupoId,
                                fecha);
        }

        // =========================================================
        // GRUPO + FECHA - SENSEI
        // =========================================================

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

        // =========================================================
        // OBTENER SENSEI AUTENTICADO
        // =========================================================

        private Usuario obtenerSenseiAutenticado(String username) {

                Usuario sensei = usuarioRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException(
                                                "Usuario autenticado no encontrado"));

                if (sensei.getRol() == null
                                || !"SENSEI".equalsIgnoreCase(
                                                sensei.getRol().getNombre())) {

                        throw new AccessDeniedException(
                                        "El usuario autenticado no tiene el rol SENSEI");
                }

                if (!"ACTIVO".equalsIgnoreCase(sensei.getEstado())) {
                        throw new AccessDeniedException(
                                        "El Sensei no se encuentra activo");
                }

                return sensei;
        }

        // =========================================================
        // OBTENER GRUPOS DEL SENSEI
        // =========================================================

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

        // =========================================================
        // VALIDAR PROPIEDAD DEL GRUPO
        // =========================================================

        private void validarGrupoDelSensei(
                        Long grupoId,
                        String username) {

                Usuario sensei = obtenerSenseiAutenticado(username);

                Grupo grupo = grupoRepository.findById(grupoId)
                                .orElseThrow(() -> new RuntimeException("Grupo no encontrado"));

                if (grupo.getSensei() == null
                                || !grupo.getSensei().getId().equals(sensei.getId())) {

                        throw new AccessDeniedException(
                                        "No tienes autorización para acceder a este grupo");
                }
        }

        // =========================================================
        // VALIDAR ESTUDIANTE ACTIVO
        // =========================================================

        private void validarEstudianteActivo(Estudiante estudiante) {

                if (!"ACTIVO".equalsIgnoreCase(estudiante.getEstado())) {
                        throw new RuntimeException(
                                        "No se puede registrar asistencia para un estudiante inactivo");
                }
        }

        // =========================================================
        // VALIDAR GRUPO ACTIVO
        // =========================================================

        private void validarGrupoActivo(Grupo grupo) {

                if (!"ACTIVO".equalsIgnoreCase(grupo.getEstado())) {
                        throw new RuntimeException(
                                        "No se puede registrar asistencia en un grupo inactivo");
                }
        }

        // =========================================================
        // VALIDAR ESTUDIANTE INSCRITO EN GRUPO
        // =========================================================

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

        // =========================================================
        // VALIDAR DATOS DE ASISTENCIA
        // =========================================================

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

                String estadoNormalizado = estado.trim().toUpperCase();

                if (!estadoNormalizado.equals("PRESENTE")
                                && !estadoNormalizado.equals("AUSENTE")
                                && !estadoNormalizado.equals("TARDANZA")
                                && !estadoNormalizado.equals("JUSTIFICADO")) {

                        throw new RuntimeException(
                                        "El estado debe ser PRESENTE, AUSENTE, TARDANZA o JUSTIFICADO");
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
