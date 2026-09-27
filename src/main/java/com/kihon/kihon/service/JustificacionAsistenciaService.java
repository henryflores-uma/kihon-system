package com.kihon.kihon.service;

import com.kihon.kihon.model.Asistencia;
import com.kihon.kihon.model.JustificacionAsistencia;
import com.kihon.kihon.model.MotivoJustificacion;
import com.kihon.kihon.model.Usuario;
import com.kihon.kihon.repository.AsistenciaRepository;
import com.kihon.kihon.repository.JustificacionAsistenciaRepository;
import com.kihon.kihon.repository.MotivoJustificacionRepository;
import com.kihon.kihon.repository.UsuarioRepository;

import org.springframework.security.core.Authentication;
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

    /*
     * =========================================================
     * CREAR JUSTIFICACIÓN
     * =========================================================
     */
    @Transactional
    public JustificacionAsistencia crearJustificacion(
            Long asistenciaId,
            Long motivoId,
            String descripcion) {

        /*
         * ==============================
         * VALIDAR ASISTENCIA
         * ==============================
         */

        if (asistenciaId == null) {

            throw new RuntimeException(
                    "La asistencia es obligatoria");
        }

        Asistencia asistencia = asistenciaRepository.findById(
                asistenciaId)
                .orElseThrow(() -> new RuntimeException(
                        "La asistencia no existe"));

        /*
         * ==============================
         * UNA JUSTIFICACIÓN POR ASISTENCIA
         * ==============================
         */

        if (justificacionRepository.existsByAsistenciaId(
                asistenciaId)) {

            throw new RuntimeException(
                    "La asistencia ya tiene una justificación registrada");
        }

        /*
         * ==============================
         * VALIDAR MOTIVO
         * ==============================
         */

        if (motivoId == null) {

            throw new RuntimeException(
                    "El motivo de justificación es obligatorio");
        }

        MotivoJustificacion motivo = motivoRepository.findById(
                motivoId)
                .orElseThrow(() -> new RuntimeException(
                        "El motivo de justificación no existe"));

        /*
         * ==============================
         * DESCRIPCIÓN
         * ==============================
         *
         * El motivo OTRO requiere
         * obligatoriamente una descripción.
         */

        String descripcionNormalizada = null;

        if (descripcion != null
                && !descripcion.isBlank()) {

            descripcionNormalizada = descripcion.trim();
        }

        if ("OTRO".equalsIgnoreCase(motivo.getNombre())
                && (descripcionNormalizada == null
                        || descripcionNormalizada.isBlank())) {

            throw new RuntimeException(
                    "Debe ingresar una descripción cuando el motivo es OTRO");
        }

        /*
         * ==============================
         * USUARIO AUTENTICADO
         * ==============================
         */

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().isBlank()) {

            throw new RuntimeException(
                    "No existe un usuario autenticado");
        }

        String username = authentication.getName();

        Usuario usuario = usuarioRepository
                .findByUsername(username)
                .orElseThrow(() -> new RuntimeException(
                        "El usuario autenticado no existe"));

        /*
         * ==============================
         * CREAR JUSTIFICACIÓN
         * ==============================
         */

        JustificacionAsistencia justificacion = new JustificacionAsistencia();

        justificacion.setAsistencia(asistencia);
        justificacion.setMotivo(motivo);
        justificacion.setDescripcion(
                descripcionNormalizada);
        justificacion.setFechaRegistro(
                LocalDateTime.now());
        justificacion.setRegistradoPor(usuario);

        return justificacionRepository.save(
                justificacion);
    }

    /*
     * =========================================================
     * BUSCAR JUSTIFICACIÓN POR ID
     * =========================================================
     */
    public JustificacionAsistencia buscarPorId(Long id) {

        return justificacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Justificación no encontrada"));
    }

    /*
     * =========================================================
     * BUSCAR JUSTIFICACIÓN DE UNA ASISTENCIA
     * =========================================================
     */
    public JustificacionAsistencia buscarPorAsistencia(
            Long asistenciaId) {

        if (asistenciaId == null) {

            throw new RuntimeException(
                    "La asistencia es obligatoria");
        }

        return justificacionRepository
                .findByAsistenciaId(asistenciaId)
                .orElseThrow(() -> new RuntimeException(
                        "La asistencia no tiene una justificación"));
    }

    /*
     * =========================================================
     * LISTAR JUSTIFICACIONES
     * =========================================================
     */
    public List<JustificacionAsistencia> listarJustificaciones() {

        return justificacionRepository.findAll();
    }

    /*
     * =========================================================
     * ELIMINAR JUSTIFICACIÓN
     * =========================================================
     *
     * La eliminación se deja disponible en el service,
     * pero todavía no la exponemos en el controller.
     *
     * Esto permite decidir posteriormente las reglas
     * de modificación/eliminación sin afectar el modelo.
     */
    @Transactional
    public void eliminarJustificacion(Long id) {

        JustificacionAsistencia justificacion = justificacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Justificación no encontrada"));

        justificacionRepository.delete(justificacion);
    }
}