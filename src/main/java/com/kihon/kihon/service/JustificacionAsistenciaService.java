package com.kihon.kihon.service;

import com.kihon.kihon.exception.RecursoNoEncontradoException;
import com.kihon.kihon.exception.ValidacionException;
import com.kihon.kihon.model.Asistencia;
import com.kihon.kihon.model.JustificacionAsistencia;
import com.kihon.kihon.model.MotivoJustificacion;
import com.kihon.kihon.model.Usuario;

import com.kihon.kihon.repository.AsistenciaRepository;
import com.kihon.kihon.repository.EstudianteRepository;
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
        private final EstudianteRepository estudianteRepository;

        public JustificacionAsistenciaService(
                        JustificacionAsistenciaRepository justificacionRepository,
                        MotivoJustificacionRepository motivoRepository,
                        AsistenciaRepository asistenciaRepository,
                        UsuarioRepository usuarioRepository,
                        EstudianteRepository estudianteRepository) {

                this.justificacionRepository = justificacionRepository;
                this.motivoRepository = motivoRepository;
                this.asistenciaRepository = asistenciaRepository;
                this.usuarioRepository = usuarioRepository;
                this.estudianteRepository = estudianteRepository;
        }

        // =========================================================
        // CREAR JUSTIFICACIÓN
        // =========================================================

        @Transactional
        public JustificacionAsistencia crearJustificacion(
                        Long asistenciaId,
                        Long motivoId,
                        String descripcion,
                        String username) {

                if (asistenciaId == null) {
                        throw new ValidacionException(
                                        "La asistencia es obligatoria");
                }

                Asistencia asistencia = asistenciaRepository.findById(asistenciaId)
                                .orElseThrow(() -> new RecursoNoEncontradoException(
                                                "La asistencia no existe"));

                validarAccesoAsistencia(asistencia);

                if (justificacionRepository.existsByAsistenciaId(asistenciaId)) {
                        throw new ValidacionException(
                                        "La asistencia ya tiene una justificación registrada");
                }

                if (motivoId == null) {
                        throw new ValidacionException(
                                        "El motivo de justificación es obligatorio");
                }

                MotivoJustificacion motivo = motivoRepository.findById(motivoId)
                                .orElseThrow(() -> new RecursoNoEncontradoException(
                                                "El motivo de justificación no existe"));

                String descripcionNormalizada = normalizarDescripcion(descripcion);

                validarDescripcionMotivo(motivo, descripcionNormalizada);

                if (username == null || username.isBlank()) {
                        throw new AccessDeniedException(
                                        "No se pudo identificar al usuario autenticado");
                }

                Usuario usuario = usuarioRepository.findByUsername(username)
                                .orElseThrow(() -> new RecursoNoEncontradoException(
                                                "El usuario autenticado no existe"));

                JustificacionAsistencia justificacion = new JustificacionAsistencia();

                justificacion.setAsistencia(asistencia);
                justificacion.setMotivo(motivo);
                justificacion.setDescripcion(descripcionNormalizada);
                justificacion.setFechaRegistro(LocalDateTime.now());
                justificacion.setRegistradoPor(usuario);

                return justificacionRepository.save(justificacion);
        }

        // =========================================================
        // ACTUALIZAR JUSTIFICACIÓN
        // =========================================================

        @Transactional
        public JustificacionAsistencia actualizarJustificacion(
                        Long id,
                        Long motivoId,
                        String descripcion) {

                if (id == null) {
                        throw new ValidacionException(
                                        "El ID de la justificación es obligatorio");
                }

                JustificacionAsistencia justificacion = justificacionRepository.findById(id)
                                .orElseThrow(() -> new RecursoNoEncontradoException(
                                                "Justificación no encontrada"));

                validarAccesoAsistencia(justificacion.getAsistencia());

                if (motivoId == null) {
                        throw new ValidacionException(
                                        "El motivo de justificación es obligatorio");
                }

                MotivoJustificacion motivo = motivoRepository.findById(motivoId)
                                .orElseThrow(() -> new RecursoNoEncontradoException(
                                                "El motivo de justificación no existe"));

                String descripcionNormalizada = normalizarDescripcion(descripcion);

                validarDescripcionMotivo(motivo, descripcionNormalizada);

                justificacion.setMotivo(motivo);
                justificacion.setDescripcion(descripcionNormalizada);

                return justificacionRepository.save(justificacion);
        }

        // =========================================================
        // BUSCAR JUSTIFICACIÓN POR ID
        // =========================================================

        @Transactional(readOnly = true)
        public JustificacionAsistencia buscarPorId(Long id) {

                if (id == null) {
                        throw new ValidacionException(
                                        "El ID de la justificación es obligatorio");
                }

                JustificacionAsistencia justificacion = justificacionRepository.findById(id)
                                .orElseThrow(() -> new RecursoNoEncontradoException(
                                                "Justificación no encontrada"));

                validarAccesoLecturaAsistencia(justificacion.getAsistencia());

                return justificacion;
        }

        // =========================================================
        // BUSCAR JUSTIFICACIÓN POR ASISTENCIA
        // =========================================================

        @Transactional(readOnly = true)
        public JustificacionAsistencia buscarPorAsistencia(Long asistenciaId) {

                if (asistenciaId == null) {
                        throw new ValidacionException(
                                        "La asistencia es obligatoria");
                }

                JustificacionAsistencia justificacion = justificacionRepository
                                .findByAsistenciaId(asistenciaId)
                                .orElseThrow(() -> new RecursoNoEncontradoException(
                                                "La asistencia no tiene una justificación"));

                validarAccesoLecturaAsistencia(justificacion.getAsistencia());

                return justificacion;
        }

        // =========================================================
        // LISTAR JUSTIFICACIONES
        // =========================================================

        @Transactional(readOnly = true)
        public List<JustificacionAsistencia> listarJustificaciones() {

                Usuario usuario = obtenerUsuarioAutenticado();

                String rol = obtenerRolUsuario(usuario);

                List<JustificacionAsistencia> justificaciones = justificacionRepository.findAll();

                // ADMIN y SECRETARIA pueden consultar todas las justificaciones.
                if ("ADMIN".equals(rol) || "SECRETARIA".equals(rol)) {
                        return justificaciones;
                }

                // SENSEI solamente puede consultar las justificaciones
                // de las asistencias pertenecientes a sus grupos.
                if ("SENSEI".equals(rol)) {

                        validarUsuarioActivo(usuario);

                        return justificaciones.stream()
                                        .filter(j -> perteneceAlSensei(
                                                        j.getAsistencia(),
                                                        usuario.getId()))
                                        .toList();
                }

                // ESTUDIANTE solamente puede consultar sus propias justificaciones.
                if ("ESTUDIANTE".equals(rol)) {

                        validarUsuarioActivo(usuario);

                        if (usuario.getPersona() == null) {
                                throw new AccessDeniedException(
                                                "No se pudo identificar la persona asociada al estudiante");
                        }

                        var estudiante = estudianteRepository.findByPersona(
                                        usuario.getPersona())
                                        .orElseThrow(() -> new AccessDeniedException(
                                                        "No existe un estudiante asociado al usuario"));

                        return justificaciones.stream()
                                        .filter(j -> j.getAsistencia() != null
                                                        && j.getAsistencia().getEstudiante() != null
                                                        && j.getAsistencia().getEstudiante().getId()
                                                                        .equals(estudiante.getId()))
                                        .toList();
                }

                throw new AccessDeniedException(
                                "No tienes autorización para consultar justificaciones");
        }

        // =========================================================
        // ELIMINAR JUSTIFICACIÓN
        // =========================================================

        @Transactional
        public void eliminarJustificacion(Long id) {

                if (id == null) {
                        throw new ValidacionException(
                                        "El ID de la justificación es obligatorio");
                }

                JustificacionAsistencia justificacion = justificacionRepository.findById(id)
                                .orElseThrow(() -> new RecursoNoEncontradoException(
                                                "Justificación no encontrada"));

                validarAccesoAsistencia(justificacion.getAsistencia());

                justificacionRepository.delete(justificacion);
        }

        // =========================================================
        // VALIDAR ACCESO DE LECTURA A UNA ASISTENCIA
        // =========================================================

        private void validarAccesoLecturaAsistencia(Asistencia asistencia) {

                Usuario usuario = obtenerUsuarioAutenticado();

                validarUsuarioActivo(usuario);

                String rol = obtenerRolUsuario(usuario);

                // ADMIN y SECRETARIA pueden consultar todas las justificaciones.
                if ("ADMIN".equals(rol) || "SECRETARIA".equals(rol)) {
                        return;
                }

                // SENSEI solamente puede consultar asistencias de sus grupos.
                if ("SENSEI".equals(rol)) {
                        validarAccesoAsistencia(asistencia);
                        return;
                }

                // ESTUDIANTE solamente puede consultar sus propias asistencias.
                if ("ESTUDIANTE".equals(rol)) {

                        if (asistencia == null
                                        || asistencia.getEstudiante() == null
                                        || usuario.getPersona() == null) {

                                throw new AccessDeniedException(
                                                "No se pudo validar la propiedad de la asistencia");
                        }

                        var estudiante = estudianteRepository.findByPersona(
                                        usuario.getPersona())
                                        .orElseThrow(() -> new AccessDeniedException(
                                                        "No existe un estudiante asociado al usuario"));

                        if (!estudiante.getId().equals(
                                        asistencia.getEstudiante().getId())) {

                                throw new AccessDeniedException(
                                                "No tienes autorización para consultar esta justificación");
                        }

                        return;
                }

                throw new AccessDeniedException(
                                "No tienes autorización para consultar justificaciones");
        }

        // =========================================================
        // VALIDAR ACCESO DE ESCRITURA A UNA ASISTENCIA
        // =========================================================

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

        // =========================================================
        // VERIFICAR PERTENENCIA DE LA ASISTENCIA AL SENSEI
        // =========================================================

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

        // =========================================================
        // IDENTIFICAR SI EL USUARIO AUTENTICADO ES SENSEI
        // =========================================================

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

        // =========================================================
        // OBTENER SENSEI AUTENTICADO
        // =========================================================

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
                                .orElseThrow(() -> new AccessDeniedException(
                                                "El usuario autenticado no existe"));

                if (sensei.getRol() == null
                                || !"SENSEI".equalsIgnoreCase(
                                                sensei.getRol().getNombre())) {

                        throw new AccessDeniedException(
                                        "El usuario no tiene el rol SENSEI");
                }

                validarUsuarioActivo(sensei);

                return sensei;
        }

        // =========================================================
        // OBTENER USUARIO AUTENTICADO
        // =========================================================

        private Usuario obtenerUsuarioAutenticado() {

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

                return usuarioRepository.findByUsername(
                                authentication.getName())
                                .orElseThrow(() -> new AccessDeniedException(
                                                "El usuario autenticado no existe"));
        }

        // =========================================================
        // OBTENER ROL DEL USUARIO
        // =========================================================

        private String obtenerRolUsuario(Usuario usuario) {

                if (usuario == null
                                || usuario.getRol() == null
                                || usuario.getRol().getNombre() == null) {

                        throw new AccessDeniedException(
                                        "No se pudo identificar el rol del usuario");
                }

                return usuario.getRol()
                                .getNombre()
                                .trim()
                                .toUpperCase();
        }

        // =========================================================
        // VALIDAR QUE EL USUARIO ESTÉ ACTIVO
        // =========================================================

        private void validarUsuarioActivo(Usuario usuario) {

                if (usuario == null
                                || usuario.getEstado() == null
                                || !"ACTIVO".equalsIgnoreCase(usuario.getEstado())) {

                        throw new AccessDeniedException(
                                        "El usuario no se encuentra activo");
                }
        }

        // =========================================================
        // NORMALIZAR DESCRIPCIÓN
        // =========================================================

        private String normalizarDescripcion(String descripcion) {

                if (descripcion == null || descripcion.isBlank()) {
                        return null;
                }

                return descripcion.trim();
        }

        // =========================================================
        // VALIDAR DESCRIPCIÓN SEGÚN EL MOTIVO
        // =========================================================

        private void validarDescripcionMotivo(
                        MotivoJustificacion motivo,
                        String descripcion) {

                if (motivo != null
                                && "OTRO".equalsIgnoreCase(motivo.getNombre())
                                && (descripcion == null || descripcion.isBlank())) {

                        throw new ValidacionException(
                                        "Debe ingresar una descripción cuando el motivo es OTRO");
                }
        }
}