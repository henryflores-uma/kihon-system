
package com.kihon.kihon.service;

import com.kihon.kihon.dto.AsistenciaResponse;
import com.kihon.kihon.dto.ReporteAsistenciaResponse;
import com.kihon.kihon.model.Asistencia;
import com.kihon.kihon.model.Grupo;
import com.kihon.kihon.model.Usuario;
import com.kihon.kihon.repository.AsistenciaRepository;
import com.kihon.kihon.repository.EstudianteRepository;
import com.kihon.kihon.repository.GrupoRepository;
import com.kihon.kihon.repository.UsuarioRepository;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class ReporteAsistenciaService {

        private final AsistenciaRepository asistenciaRepository;
        private final EstudianteRepository estudianteRepository;
        private final GrupoRepository grupoRepository;
        private final UsuarioRepository usuarioRepository;

        public ReporteAsistenciaService(
                        AsistenciaRepository asistenciaRepository,
                        EstudianteRepository estudianteRepository,
                        GrupoRepository grupoRepository,
                        UsuarioRepository usuarioRepository) {

                this.asistenciaRepository = asistenciaRepository;
                this.estudianteRepository = estudianteRepository;
                this.grupoRepository = grupoRepository;
                this.usuarioRepository = usuarioRepository;
        }

        // ==========================================
        // REPORTE DIARIO
        // ==========================================

        @Transactional(readOnly = true)
        public ReporteAsistenciaResponse generarReporteDiario(
                        LocalDate fecha,
                        String username) {

                validarUsuarioAutenticado(username);

                if (fecha == null) {
                        throw new RuntimeException(
                                        "La fecha es obligatoria");
                }

                List<Asistencia> asistencias = asistenciaRepository.findByFecha(fecha);

                asistencias = filtrarPorPermisos(asistencias, username);

                return construirReporte(
                                fecha,
                                fecha,
                                asistencias);
        }

        // ==========================================
        // REPORTE SEMANAL
        // ==========================================

        @Transactional(readOnly = true)
        public ReporteAsistenciaResponse generarReporteSemanal(
                        LocalDate fechaInicio,
                        LocalDate fechaFin,
                        String username) {

                validarUsuarioAutenticado(username);
                validarPeriodo(fechaInicio, fechaFin);

                List<Asistencia> asistencias = asistenciaRepository.findByFechaBetween(
                                fechaInicio,
                                fechaFin);

                asistencias = filtrarPorPermisos(asistencias, username);

                return construirReporte(
                                fechaInicio,
                                fechaFin,
                                asistencias);
        }

        // ==========================================
        // REPORTE MENSUAL
        // ==========================================

        @Transactional(readOnly = true)
        public ReporteAsistenciaResponse generarReporteMensual(
                        int anio,
                        int mes,
                        String username) {

                validarUsuarioAutenticado(username);

                if (mes < 1 || mes > 12) {
                        throw new RuntimeException(
                                        "El mes debe estar entre 1 y 12");
                }

                LocalDate fechaInicio;

                try {
                        fechaInicio = LocalDate.of(anio, mes, 1);
                } catch (Exception e) {
                        throw new RuntimeException(
                                        "El año indicado no es válido");
                }

                LocalDate fechaFin = fechaInicio.withDayOfMonth(
                                fechaInicio.lengthOfMonth());

                List<Asistencia> asistencias = asistenciaRepository.findByFechaBetween(
                                fechaInicio,
                                fechaFin);

                asistencias = filtrarPorPermisos(asistencias, username);

                return construirReporte(
                                fechaInicio,
                                fechaFin,
                                asistencias);
        }

        // ==========================================
        // REPORTE POR ESTUDIANTE
        // ==========================================

        @Transactional(readOnly = true)
        public ReporteAsistenciaResponse generarReportePorEstudiante(
                        Long estudianteId,
                        String username) {

                validarUsuarioAutenticado(username);

                if (estudianteId == null) {
                        throw new RuntimeException(
                                        "El ID del estudiante es obligatorio");
                }

                estudianteRepository.findById(estudianteId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Estudiante no encontrado"));

                List<Asistencia> asistencias = asistenciaRepository.findByEstudianteId(
                                estudianteId);

                // Para SENSEI, solo se consideran las asistencias
                // registradas en sus propios grupos.

                asistencias = filtrarPorPermisos(asistencias, username);

                if (asistencias.isEmpty()) {
                        return construirReporte(
                                        null,
                                        null,
                                        asistencias);
                }

                LocalDate fechaInicio = obtenerFechaMinima(asistencias);
                LocalDate fechaFin = obtenerFechaMaxima(asistencias);

                return construirReporte(
                                fechaInicio,
                                fechaFin,
                                asistencias);
        }

        // ==========================================
        // REPORTE POR GRUPO
        // ==========================================

        @Transactional(readOnly = true)
        public ReporteAsistenciaResponse generarReportePorGrupo(
                        Long grupoId,
                        String username) {

                Usuario usuario = validarUsuarioAutenticado(username);

                if (grupoId == null) {
                        throw new RuntimeException(
                                        "El ID del grupo es obligatorio");
                }

                Grupo grupo = grupoRepository.findById(grupoId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Grupo no encontrado"));

                // El Sensei solamente puede consultar reportes
                // de grupos que tiene asignados.

                if ("SENSEI".equals(usuario.getRol().getNombre())) {

                        if (grupo.getSensei() == null
                                        || grupo.getSensei().getId() == null
                                        || !grupo.getSensei().getId().equals(usuario.getId())) {

                                throw new AccessDeniedException(
                                                "No tienes acceso al reporte de este grupo");
                        }
                }

                List<Asistencia> asistencias = asistenciaRepository.findByGrupoId(
                                grupoId);

                if (asistencias.isEmpty()) {
                        return construirReporte(
                                        null,
                                        null,
                                        asistencias);
                }

                LocalDate fechaInicio = obtenerFechaMinima(asistencias);
                LocalDate fechaFin = obtenerFechaMaxima(asistencias);

                return construirReporte(
                                fechaInicio,
                                fechaFin,
                                asistencias);
        }

        // ==========================================
        // FILTRAR ASISTENCIAS SEGÚN PERMISOS
        // ==========================================

        private List<Asistencia> filtrarPorPermisos(
                        List<Asistencia> asistencias,
                        String username) {

                Usuario usuario = validarUsuarioAutenticado(username);

                // ADMIN y SECRETARIA conservan el acceso completo.

                String nombreRol = usuario.getRol().getNombre();

                if ("ADMIN".equals(nombreRol)
                                || "SECRETARIA".equals(nombreRol)) {

                        return asistencias;
                }

                // SENSEI solo recibe asistencias de sus grupos.

                if (!"SENSEI".equals(nombreRol)) {
                        throw new AccessDeniedException(
                                        "No tienes permisos para consultar reportes");
                }

                List<Grupo> grupos = grupoRepository.findBySenseiId(usuario.getId());

                Set<Long> gruposDelSensei = new HashSet<>();

                if (grupos != null) {

                        for (Grupo grupo : grupos) {

                                if (grupo != null && grupo.getId() != null) {
                                        gruposDelSensei.add(grupo.getId());
                                }
                        }
                }

                return asistencias.stream()
                                .filter(asistencia -> asistencia.getGrupo() != null
                                                && asistencia.getGrupo().getId() != null
                                                && gruposDelSensei.contains(
                                                                asistencia.getGrupo().getId()))
                                .toList();
        }

        // ==========================================
        // OBTENER FECHA MÍNIMA
        // ==========================================

        private LocalDate obtenerFechaMinima(List<Asistencia> asistencias) {

                LocalDate fechaMinima = null;

                if (asistencias == null) {
                        return null;
                }

                for (Asistencia asistencia : asistencias) {

                        if (asistencia == null || asistencia.getFecha() == null) {
                                continue;
                        }

                        LocalDate fecha = asistencia.getFecha();

                        if (fechaMinima == null || fecha.isBefore(fechaMinima)) {
                                fechaMinima = fecha;
                        }
                }

                return fechaMinima;
        }

        // ==========================================
        // OBTENER FECHA MÁXIMA
        // ==========================================

        private LocalDate obtenerFechaMaxima(List<Asistencia> asistencias) {

                LocalDate fechaMaxima = null;

                if (asistencias == null) {
                        return null;
                }

                for (Asistencia asistencia : asistencias) {

                        if (asistencia == null || asistencia.getFecha() == null) {
                                continue;
                        }

                        LocalDate fecha = asistencia.getFecha();

                        if (fechaMaxima == null || fecha.isAfter(fechaMaxima)) {
                                fechaMaxima = fecha;
                        }
                }

                return fechaMaxima;
        }

        // ==========================================
        // VALIDAR USUARIO AUTENTICADO
        // ==========================================

        private Usuario validarUsuarioAutenticado(String username) {

                if (username == null || username.isBlank()) {
                        throw new AccessDeniedException(
                                        "No se pudo identificar al usuario autenticado");
                }

                Usuario usuario = usuarioRepository.findByUsername(username)
                                .orElseThrow(() -> new AccessDeniedException(
                                                "El usuario autenticado no existe"));

                if (!"ACTIVO".equals(usuario.getEstado())) {
                        throw new AccessDeniedException(
                                        "El usuario no se encuentra activo");
                }

                if (usuario.getRol() == null
                                || usuario.getRol().getNombre() == null) {

                        throw new AccessDeniedException(
                                        "El usuario no tiene un rol válido");
                }

                String nombreRol = usuario.getRol().getNombre();

                if (!"ADMIN".equals(nombreRol)
                                && !"SECRETARIA".equals(nombreRol)
                                && !"SENSEI".equals(nombreRol)) {

                        throw new AccessDeniedException(
                                        "No tienes permisos para consultar reportes");
                }

                return usuario;
        }

        // ==========================================
        // CONSTRUIR REPORTE
        // ==========================================

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

                        porcentajeAsistencia = ((double) (presentes + tardanzas) / total) * 100;

                        porcentajeAsistencia = Math.round(porcentajeAsistencia * 100.0) / 100.0;
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

        // ==========================================
        // VALIDAR PERIODO
        // ==========================================

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

        // ==========================================
        // CONVERTIR A RESPONSE
        // ==========================================

        private AsistenciaResponse convertirAResponse(
                        Asistencia asistencia) {

                String estudianteNombre = asistencia
                                .getEstudiante()
                                .getPersona()
                                .getNombre()
                                + " "
                                + asistencia
                                                .getEstudiante()
                                                .getPersona()
                                                .getApellido();

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
