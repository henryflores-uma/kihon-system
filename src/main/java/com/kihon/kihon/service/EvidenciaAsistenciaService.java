package com.kihon.kihon.service;

import com.kihon.kihon.model.Asistencia;
import com.kihon.kihon.model.EvidenciaAsistencia;
import com.kihon.kihon.model.JustificacionAsistencia;
import com.kihon.kihon.model.Usuario;
import com.kihon.kihon.repository.EvidenciaAsistenciaRepository;
import com.kihon.kihon.repository.JustificacionAsistenciaRepository;
import com.kihon.kihon.repository.UsuarioRepository;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.kihon.kihon.model.Estudiante;
import com.kihon.kihon.repository.EstudianteRepository;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class EvidenciaAsistenciaService {

        private static final int MIN_SEGUNDOS_URL = 60;
        private static final int MAX_SEGUNDOS_URL = 3600;

        private static final long MAX_TAMANO_ARCHIVO = 5 * 1024 * 1024;

        private static final List<String> TIPOS_MIME_PERMITIDOS = List.of(
                        "application/pdf",
                        "image/jpeg",
                        "image/png");

        private final EvidenciaAsistenciaRepository evidenciaRepository;
        private final JustificacionAsistenciaRepository justificacionRepository;
        private final UsuarioRepository usuarioRepository;
        private final SupabaseStorageService supabaseStorageService;
        private final EstudianteRepository estudianteRepository;

        public EvidenciaAsistenciaService(
                        EvidenciaAsistenciaRepository evidenciaRepository,
                        JustificacionAsistenciaRepository justificacionRepository,
                        UsuarioRepository usuarioRepository,
                        EstudianteRepository estudianteRepository,
                        SupabaseStorageService supabaseStorageService) {

                this.evidenciaRepository = evidenciaRepository;
                this.justificacionRepository = justificacionRepository;
                this.usuarioRepository = usuarioRepository;
                this.estudianteRepository = estudianteRepository;
                this.supabaseStorageService = supabaseStorageService;
        }

        // ==========================================
        // SUBIR EVIDENCIA
        // ==========================================

        @Transactional
        public EvidenciaAsistencia subirEvidencia(
                        Long justificacionId,
                        MultipartFile archivo,
                        String username) {

                if (justificacionId == null) {
                        throw new RuntimeException(
                                        "La justificación es obligatoria");
                }

                JustificacionAsistencia justificacion = justificacionRepository
                                .findById(justificacionId)
                                .orElseThrow(() -> new RuntimeException(
                                                "La justificación no existe"));

                validarAccesoJustificacion(justificacion, username);

                validarArchivo(archivo);

                String nombreOriginal = archivo.getOriginalFilename();

                if (nombreOriginal == null || nombreOriginal.isBlank()) {
                        throw new RuntimeException(
                                        "El archivo no tiene un nombre válido");
                }

                String nombreArchivo = obtenerNombreSeguro(nombreOriginal);

                String tipoMime = archivo.getContentType();

                if (tipoMime == null || tipoMime.isBlank()) {
                        throw new RuntimeException(
                                        "No se pudo determinar el tipo del archivo");
                }

                /*
                 * Creamos primero el registro para obtener su ID.
                 */

                EvidenciaAsistencia evidencia = new EvidenciaAsistencia();

                evidencia.setJustificacion(justificacion);
                evidencia.setNombreArchivo(nombreArchivo);
                evidencia.setTipoMime(tipoMime);
                evidencia.setFechaSubida(LocalDateTime.now());
                evidencia.setRutaArchivo("PENDIENTE");

                evidencia = evidenciaRepository.save(evidencia);

                /*
                 * La ruta física de Storage no utiliza directamente
                 * el nombre original del archivo.
                 */

                String nombreStorage = generarNombreStorage(nombreArchivo);

                String ruta = "justificaciones/"
                                + justificacionId
                                + "/"
                                + evidencia.getId()
                                + "-"
                                + nombreStorage;

                try {

                        supabaseStorageService.subirEvidencia(
                                        archivo,
                                        ruta);

                        evidencia.setRutaArchivo(ruta);

                        return evidenciaRepository.save(evidencia);

                } catch (Exception e) {

                        /*
                         * Si Storage falla, intentamos eliminar
                         * cualquier archivo que pudiera haberse creado.
                         */

                        try {
                                supabaseStorageService.eliminarEvidencia(ruta);
                        } catch (Exception ignored) {
                        }

                        /*
                         * Eliminamos también el registro temporal.
                         */

                        evidenciaRepository.delete(evidencia);

                        throw new RuntimeException(
                                        "No se pudo subir la evidencia",
                                        e);
                }
        }

        // ==========================================
        // VALIDAR ARCHIVO
        // ==========================================

        private void validarArchivo(MultipartFile archivo) {

                if (archivo == null || archivo.isEmpty()) {
                        throw new RuntimeException(
                                        "Debe seleccionar un archivo");
                }

                if (archivo.getSize() > MAX_TAMANO_ARCHIVO) {
                        throw new RuntimeException(
                                        "El archivo no puede superar los 5 MB");
                }

                String nombreArchivo = archivo.getOriginalFilename();

                if (nombreArchivo == null || nombreArchivo.isBlank()) {
                        throw new RuntimeException(
                                        "El archivo no tiene un nombre válido");
                }

                String tipoMime = archivo.getContentType();

                if (tipoMime == null
                                || !TIPOS_MIME_PERMITIDOS.contains(tipoMime.toLowerCase())) {

                        throw new RuntimeException(
                                        "Formato no permitido. Solo se aceptan PDF, JPG y PNG");
                }

                String extension = nombreArchivo.substring(
                                nombreArchivo.lastIndexOf(".") + 1)
                                .toLowerCase();

                boolean extensionValida = ("application/pdf".equalsIgnoreCase(tipoMime)
                                && "pdf".equals(extension))
                                || ("image/jpeg".equalsIgnoreCase(tipoMime)
                                                && ("jpg".equals(extension) || "jpeg".equals(extension)))
                                || ("image/png".equalsIgnoreCase(tipoMime)
                                                && "png".equals(extension));

                if (!extensionValida) {
                        throw new RuntimeException(
                                        "La extensión del archivo no coincide con su formato");
                }
        }

        // ==========================================
        // LISTAR POR JUSTIFICACIÓN
        // ==========================================

        @Transactional(readOnly = true)
        public List<EvidenciaAsistencia> listarPorJustificacion(
                        Long justificacionId,
                        String username) {

                if (justificacionId == null) {
                        throw new RuntimeException(
                                        "La justificación es obligatoria");
                }

                JustificacionAsistencia justificacion = justificacionRepository
                                .findById(justificacionId)
                                .orElseThrow(() -> new RuntimeException(
                                                "La justificación no existe"));

                validarAccesoLecturaJustificacion(justificacion, username);

                return evidenciaRepository.findByJustificacionId(justificacionId);
        }

        // ==========================================
        // BUSCAR POR ID
        // ==========================================

        @Transactional(readOnly = true)
        public EvidenciaAsistencia buscarPorId(
                        Long id,
                        String username) {

                if (id == null) {
                        throw new RuntimeException(
                                        "El ID de la evidencia es obligatorio");
                }

                EvidenciaAsistencia evidencia = evidenciaRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException(
                                                "La evidencia no existe"));

                validarAccesoEvidencia(evidencia, username);

                return evidencia;
        }

        // ==========================================
        // GENERAR URL FIRMADA
        // ==========================================

        @Transactional(readOnly = true)
        public String generarUrlFirmada(
                        Long id,
                        int segundos,
                        String username) {

                if (segundos < MIN_SEGUNDOS_URL
                                || segundos > MAX_SEGUNDOS_URL) {

                        throw new RuntimeException(
                                        "La duración de la URL debe estar entre "
                                                        + MIN_SEGUNDOS_URL
                                                        + " y "
                                                        + MAX_SEGUNDOS_URL
                                                        + " segundos");
                }

                EvidenciaAsistencia evidencia = buscarPorId(id, username);

                if (evidencia.getRutaArchivo() == null
                                || evidencia.getRutaArchivo().isBlank()
                                || "PENDIENTE".equals(evidencia.getRutaArchivo())) {

                        throw new RuntimeException(
                                        "La evidencia no tiene un archivo almacenado");
                }

                try {

                        return supabaseStorageService.generarUrlFirmadaEvidencia(
                                        evidencia.getRutaArchivo(),
                                        segundos);

                } catch (InterruptedException e) {

                        Thread.currentThread().interrupt();

                        throw new RuntimeException(
                                        "La generación de la URL fue interrumpida",
                                        e);

                } catch (IOException e) {

                        throw new RuntimeException(
                                        "No se pudo generar la URL firmada",
                                        e);
                }
        }

        // ==========================================
        // ELIMINAR EVIDENCIA
        // ==========================================

        // ==========================================
        // ELIMINAR EVIDENCIA
        // ==========================================

        @Transactional
        public void eliminarEvidencia(
                        Long id,
                        String username) {

                EvidenciaAsistencia evidencia = buscarPorId(id, username);

                // La eliminación requiere permisos de gestión.
                validarAccesoJustificacion(
                                evidencia.getJustificacion(),
                                username);

                String ruta = evidencia.getRutaArchivo();

                try {

                        if (ruta != null
                                        && !ruta.isBlank()
                                        && !"PENDIENTE".equals(ruta)) {

                                supabaseStorageService.eliminarEvidencia(ruta);
                        }

                } catch (InterruptedException e) {

                        Thread.currentThread().interrupt();

                        throw new RuntimeException(
                                        "La eliminación del archivo fue interrumpida",
                                        e);

                } catch (IOException e) {

                        throw new RuntimeException(
                                        "No se pudo eliminar el archivo de Supabase Storage",
                                        e);
                }

                evidenciaRepository.delete(evidencia);
        }

        // ==========================================
        // VALIDAR ACCESO A JUSTIFICACIÓN
        // ==========================================

        private void validarAccesoJustificacion(
                        JustificacionAsistencia justificacion,
                        String username) {

                Usuario usuario = obtenerUsuarioAutenticado(username);

                String nombreRol = usuario.getRol() != null
                                && usuario.getRol().getNombre() != null
                                                ? usuario.getRol().getNombre().trim().toUpperCase()
                                                : "";

                /*
                 * ADMIN y SECRETARIA pueden acceder a todas
                 * las justificaciones y evidencias.
                 */

                if ("ADMIN".equals(nombreRol)
                                || "SECRETARIA".equals(nombreRol)) {
                        return;
                }

                /*
                 * El Sensei solo puede acceder a las evidencias
                 * de asistencias de sus propios grupos.
                 */

                if (!"SENSEI".equals(nombreRol)) {
                        throw new AccessDeniedException(
                                        "No tienes permisos para acceder a esta evidencia");
                }

                Asistencia asistencia = justificacion.getAsistencia();

                if (asistencia == null
                                || asistencia.getGrupo() == null
                                || asistencia.getGrupo().getSensei() == null) {

                        throw new AccessDeniedException(
                                        "No se pudo validar el grupo de la asistencia");
                }

                Long senseiId = asistencia.getGrupo().getSensei().getId();

                if (senseiId == null
                                || !senseiId.equals(usuario.getId())) {

                        throw new AccessDeniedException(
                                        "No tienes acceso a evidencias de grupos asignados a otro Sensei");
                }
        }

        // ==========================================
        // VALIDAR ACCESO DE LECTURA A JUSTIFICACIÓN
        // ==========================================

        private void validarAccesoLecturaJustificacion(
                        JustificacionAsistencia justificacion,
                        String username) {

                Usuario usuario = obtenerUsuarioAutenticado(username);

                String nombreRol = usuario.getRol().getNombre()
                                .trim()
                                .toUpperCase();

                // ADMIN y SECRETARIA
                if ("ADMIN".equals(nombreRol)
                                || "SECRETARIA".equals(nombreRol)) {
                        return;
                }

                Asistencia asistencia = justificacion.getAsistencia();

                if (asistencia == null
                                || asistencia.getEstudiante() == null) {

                        throw new AccessDeniedException(
                                        "No se pudo validar la asistencia asociada");
                }

                // SENSEI
                if ("SENSEI".equals(nombreRol)) {

                        if (asistencia.getGrupo() == null
                                        || asistencia.getGrupo().getSensei() == null) {

                                throw new AccessDeniedException(
                                                "No se pudo validar el grupo de la asistencia");
                        }

                        Long senseiId = asistencia.getGrupo()
                                        .getSensei()
                                        .getId();

                        if (senseiId == null
                                        || !senseiId.equals(usuario.getId())) {

                                throw new AccessDeniedException(
                                                "No tienes acceso a evidencias de este grupo");
                        }

                        return;
                }

                // ESTUDIANTE
                if ("ESTUDIANTE".equals(nombreRol)) {

                        if (usuario.getPersona() == null) {
                                throw new AccessDeniedException(
                                                "El usuario no tiene una persona asociada");
                        }

                        Estudiante estudiante = estudianteRepository
                                        .findByPersona(usuario.getPersona())
                                        .orElseThrow(() -> new AccessDeniedException(
                                                        "No existe un estudiante asociado al usuario"));

                        if (!estudiante.getId().equals(
                                        asistencia.getEstudiante().getId())) {

                                throw new AccessDeniedException(
                                                "No puedes consultar evidencias de otro estudiante");
                        }

                        return;
                }

                throw new AccessDeniedException(
                                "No tienes permisos para consultar estas evidencias");
        }
        // ==========================================
        // VALIDAR ACCESO A EVIDENCIA
        // ==========================================

        private void validarAccesoEvidencia(
                        EvidenciaAsistencia evidencia,
                        String username) {

                if (evidencia.getJustificacion() == null) {
                        throw new AccessDeniedException(
                                        "La evidencia no tiene una justificación asociada");
                }

                validarAccesoLecturaJustificacion(
                                evidencia.getJustificacion(),
                                username);
        }

        // ==========================================
        // OBTENER USUARIO AUTENTICADO
        // ==========================================

        private Usuario obtenerUsuarioAutenticado(String username) {

                if (username == null || username.isBlank()) {
                        throw new AccessDeniedException(
                                        "No se pudo identificar al usuario autenticado");
                }

                Usuario usuario = usuarioRepository.findByUsername(username)
                                .orElseThrow(() -> new AccessDeniedException(
                                                "El usuario autenticado no existe"));

                if (usuario.getRol() == null
                                || usuario.getRol().getNombre() == null) {

                        throw new AccessDeniedException(
                                        "El usuario no tiene un rol válido");
                }

                if (!"ACTIVO".equals(usuario.getEstado())) {
                        throw new AccessDeniedException(
                                        "El usuario no se encuentra activo");
                }

                return usuario;
        }

        // ==========================================
        // OBTENER NOMBRE SEGURO
        // ==========================================

        private String obtenerNombreSeguro(String nombreOriginal) {

                String nombre = nombreOriginal.trim();

                nombre = nombre.replace("\\", "/");

                int ultimaBarra = nombre.lastIndexOf("/");

                if (ultimaBarra >= 0) {
                        nombre = nombre.substring(ultimaBarra + 1);
                }

                if (nombre.isBlank()) {
                        throw new RuntimeException(
                                        "El nombre del archivo no es válido");
                }

                return nombre;
        }

        // ==========================================
        // GENERAR NOMBRE STORAGE
        // ==========================================

        private String generarNombreStorage(String nombreArchivo) {

                String extension = "";

                int punto = nombreArchivo.lastIndexOf(".");

                if (punto > 0
                                && punto < nombreArchivo.length() - 1) {

                        extension = nombreArchivo.substring(punto);
                }

                String uuid = UUID.randomUUID()
                                .toString()
                                .replace("-", "");

                return uuid + extension;
        }
}