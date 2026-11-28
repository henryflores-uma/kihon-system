
package com.kihon.kihon.service;
//import com.kihon.kihon.repository.EstudianteRepository;
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
    // ACTUALIZAR JUSTIFICACIÓN
    // ==========================================

    @Transactional
    public JustificacionAsistencia actualizarJustificacion(
            Long id,
            Long motivoId,
            String descripcion) {

        if (id == null) {
            throw new RuntimeException(
                    "El ID de la justificación es obligatorio");
        }

        // Buscar la justificación existente
        JustificacionAsistencia justificacion = justificacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Justificación no encontrada"));

        // Validar permisos sobre la asistencia relacionada
        validarAccesoAsistencia(justificacion.getAsistencia());

        // Validar que se haya seleccionado un motivo
        if (motivoId == null) {
            throw new RuntimeException(
                    "El motivo de justificación es obligatorio");
        }

        // Buscar el nuevo motivo
        MotivoJustificacion motivo = motivoRepository.findById(motivoId)
                .orElseThrow(() -> new RuntimeException(
                        "El motivo de justificación no existe"));

        // Normalizar descripción
        String descripcionNormalizada = null;

        if (descripcion != null && !descripcion.isBlank()) {
            descripcionNormalizada = descripcion.trim();
        }

        // Validar descripción cuando el motivo es OTRO
        if ("OTRO".equalsIgnoreCase(motivo.getNombre())
                && (descripcionNormalizada == null
                        || descripcionNormalizada.isBlank())) {

            throw new RuntimeException(
                    "Debe ingresar una descripción cuando el motivo es OTRO");
        }

        // Actualizar únicamente los campos permitidos
        justificacion.setMotivo(motivo);
        justificacion.setDescripcion(descripcionNormalizada);

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

                                                validarAccesoLecturaAsistencia(justificacion.getAsistencia());

                return justificacion;
        }

        // ==========================================
        // BUSCAR JUSTIFICACIÓN POR ASISTENCIA
        // ==========================================
@Transactional(readOnly = true)
public JustificacionAsistencia buscarPorAsistencia(Long asistenciaId) {

    if (asistenciaId == null) {
        throw new ValidacionException(
            "La asistencia es obligatoria"
        );
    }

    JustificacionAsistencia justificacion = justificacionRepository
        .findByAsistenciaId(asistenciaId)
        .orElseThrow(() -> new RecursoNoEncontradoException(
            "La asistencia no tiene una justificación"
        ));

        validarAccesoLecturaAsistencia(justificacion.getAsistencia());

    return justificacion;
}

// ==========================================
// VALIDAR ACCESO DE LECTURA A UNA ASISTENCIA
// ==========================================

private void validarAccesoLecturaAsistencia(Asistencia asistencia) {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();
    
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null) {
    
            throw new AccessDeniedException(
                    "No existe un usuario autenticado");
        }
    
        Usuario usuario = usuarioRepository.findByUsername(
                authentication.getName())
                .orElseThrow(() -> new AccessDeniedException(
                        "El usuario autenticado no existe"));
    
        if (usuario.getEstado() == null
                || !"ACTIVO".equalsIgnoreCase(usuario.getEstado())) {
    
            throw new AccessDeniedException(
                    "El usuario no se encuentra activo");
        }
    
        String rol = usuario.getRol() != null
                && usuario.getRol().getNombre() != null
                ? usuario.getRol().getNombre().trim().toUpperCase()
                : "";
    
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
    
            Usuario estudianteUsuario = usuario;
    
            var estudiante = estudianteRepository.findByPersona(
                    estudianteUsuario.getPersona())
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
