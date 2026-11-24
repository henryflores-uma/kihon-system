
package com.kihon.kihon.service;

import com.kihon.kihon.model.Asistencia;
import com.kihon.kihon.model.JustificacionAsistencia;
import com.kihon.kihon.model.MotivoJustificacion;
import com.kihon.kihon.model.Usuario;

import com.kihon.kihon.repository.AsistenciaRepository;
import com.kihon.kihon.repository.JustificacionAsistenciaRepository;
import com.kihon.kihon.repository.MotivoJustificacionRepository;
import com.kihon.kihon.repository.UsuarioRepository;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class JustificacionAsistenciaService {

        private final JustificacionAsistenciaRepository justificacionRepository;
        private final MotivoJustificacionRepository motivoRepository;
        private final AsistenciaRepository asistenciaRepository;
        private final UsuarioRepository usuarioRepository;

        public JustificacionAsistenciaService(
                        JustificacionAsistenciaRepository justificacionRepository,
                        MotivoJustificacionRepository motivoRepository,
                        AsistenciaRepository asistenciaRepository,
                        UsuarioRepository usuarioRepository) {

                this.justificacionRepository = justificacionRepository;
                this.motivoRepository = motivoRepository;
                this.asistenciaRepository = asistenciaRepository;
                this.usuarioRepository = usuarioRepository;
        }

        // ==========================================
        // CREAR JUSTIFICACIÓN
        // ==========================================

        @Transactional
        public JustificacionAsistencia crearJustificacion(
                        Long asistenciaId,
                        Long motivoId,
                        String descripcion,
                        String username) {

                if (asistenciaId == null) {
                        throw new RuntimeException(
                                        "La asistencia es obligatoria");
                }

                Asistencia asistencia = asistenciaRepository.findById(asistenciaId)
                                .orElseThrow(() -> new RuntimeException(
                                                "La asistencia no existe"));

                validarAccesoAsistencia(asistencia);

                if (justificacionRepository.existsByAsistenciaId(asistenciaId)) {
                        throw new RuntimeException(
                                        "La asistencia ya tiene una justificación registrada");
                }

                if (motivoId == null) {
                        throw new RuntimeException(
                                        "El motivo de justificación es obligatorio");
                }

                MotivoJustificacion motivo = motivoRepository.findById(motivoId)
                                .orElseThrow(() -> new RuntimeException(
                                                "El motivo de justificación no existe"));

                String descripcionNormalizada = null;

                if (descripcion != null && !descripcion.isBlank()) {
                        descripcionNormalizada = descripcion.trim();
                }

                if ("OTRO".equalsIgnoreCase(motivo.getNombre())
                                && (descripcionNormalizada == null
                                                || descripcionNormalizada.isBlank())) {

                        throw new RuntimeException(
                                        "Debe ingresar una descripción cuando el motivo es OTRO");
                }

                Usuario usuario = usuarioRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException(
                                                "El usuario autenticado no existe"));

                JustificacionAsistencia justificacion = new JustificacionAsistencia();

                justificacion.setAsistencia(asistencia);
                justificacion.setMotivo(motivo);
                justificacion.setDescripcion(descripcionNormalizada);
                justificacion.setFechaRegistro(LocalDateTime.now());
                justificacion.setRegistradoPor(usuario);

                return justificacionRepository.save(justificacion);
        }

        // ==========================================
        // BUSCAR JUSTIFICACIÓN POR ID
        // ==========================================

        @Transactional(readOnly = true)
        public JustificacionAsistencia buscarPorId(Long id) {

                JustificacionAsistencia justificacion = justificacionRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException(
                                                "Justificación no encontrada"));

                validarAccesoAsistencia(justificacion.getAsistencia());

                return justificacion;
        }

        // ==========================================
        // BUSCAR JUSTIFICACIÓN POR ASISTENCIA
        // ==========================================

        @Transactional(readOnly = true)
        public JustificacionAsistencia buscarPorAsistencia(
                        Long asistenciaId) {

                if (asistenciaId == null) {
                        throw new RuntimeException(
                                        "La asistencia es obligatoria");
                }

                JustificacionAsistencia justificacion = justificacionRepository.findByAsistenciaId(asistenciaId)
                                .orElseThrow(() -> new RuntimeException(
                                                "La asistencia no tiene una justificación"));

                validarAccesoAsistencia(justificacion.getAsistencia());

                return justificacion;
        }

        // ==========================================
        // LISTAR JUSTIFICACIONES
        // ==========================================

        @Transactional(readOnly = true)
        public List<JustificacionAsistencia> listarJustificaciones() {

                List<JustificacionAsistencia> justificaciones = justificacionRepository.findAll();

                if (!esSenseiAutenticado()) {
                        return justificaciones;
                }

                Usuario sensei = obtenerSenseiAutenticado();

                return justificaciones.stream()
                                .filter(j -> perteneceAlSensei(
                                                j.getAsistencia(),
                                                sensei.getId()))
                                .toList();
        }

        // ==========================================
        // ELIMINAR JUSTIFICACIÓN
        // ==========================================

        @Transactional
        public void eliminarJustificacion(Long id) {

                JustificacionAsistencia justificacion = justificacionRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException(
                                                "Justificación no encontrada"));

                validarAccesoAsistencia(justificacion.getAsistencia());

                justificacionRepository.delete(justificacion);
        }

        // ==========================================
        // VALIDAR ACCESO A UNA ASISTENCIA
        // ==========================================

        private void validarAccesoAsistencia(Asistencia asistencia) {

                if (!esSenseiAutenticado()) {
                        return;
                }

                Usuario sensei = obtenerSenseiAutenticado();

                if (!perteneceAlSensei(asistencia, sensei.getId())) {
                        throw new AccessDeniedException(
                                        "No tienes autorización para acceder a esta justificación");
                }
        }

        // ==========================================
        // VERIFICAR PERTENENCIA DE LA ASISTENCIA
        // ==========================================

        private boolean perteneceAlSensei(
                        Asistencia asistencia,
                        Long senseiId) {

                if (asistencia == null
                                || asistencia.getGrupo() == null
                                || asistencia.getGrupo().getSensei() == null
                                || asistencia.getGrupo().getSensei().getId() == null
                                || senseiId == null) {

                        return false;
                }

                return asistencia.getGrupo()
                                .getSensei()
                                .getId()
                                .equals(senseiId);
        }

        // ==========================================
        // IDENTIFICAR SI ES SENSEI
        // ==========================================

        private boolean esSenseiAutenticado() {

                Authentication authentication = SecurityContextHolder
                                .getContext()
                                .getAuthentication();

                if (authentication == null
                                || !authentication.isAuthenticated()
                                || authentication.getAuthorities() == null) {

                        throw new AccessDeniedException(
                                        "No existe un usuario autenticado");
                }

                boolean esSensei = false;
                boolean esAdministradorOSecretaria = false;

                for (GrantedAuthority authority : authentication.getAuthorities()) {

                        if (authority == null || authority.getAuthority() == null) {
                                continue;
                        }

                        String rol = authority.getAuthority();

                        if ("ROLE_SENSEI".equals(rol)) {
                                esSensei = true;
                        }

                        if ("ROLE_ADMIN".equals(rol)
                                        || "ROLE_SECRETARIA".equals(rol)) {

                                esAdministradorOSecretaria = true;
                        }
                }

                if (esSensei) {
                        return true;
                }

                if (esAdministradorOSecretaria) {
                        return false;
                }

                throw new AccessDeniedException(
                                "No tienes autorización para acceder a las justificaciones");
        }

        // ==========================================
        // OBTENER SENSEI AUTENTICADO
        // ==========================================

        private Usuario obtenerSenseiAutenticado() {

                Authentication authentication = SecurityContextHolder
                                .getContext()
                                .getAuthentication();

                if (authentication == null
                                || !authentication.isAuthenticated()
                                || authentication.getName() == null
                                || authentication.getName().isBlank()) {

                        throw new AccessDeniedException(
                                        "No existe un usuario autenticado");
                }

                Usuario sensei = usuarioRepository.findByUsername(
                                authentication.getName())
                                .orElseThrow(() -> new RuntimeException(
                                                "El usuario autenticado no existe"));

                if (sensei.getRol() == null
                                || !"SENSEI".equalsIgnoreCase(
                                                sensei.getRol().getNombre())) {

                        throw new AccessDeniedException(
                                        "El usuario no tiene el rol SENSEI");
                }

                if (!"ACTIVO".equalsIgnoreCase(sensei.getEstado())) {
                        throw new AccessDeniedException(
                                        "El Sensei no se encuentra activo");
                }

                return sensei;
        }
}
