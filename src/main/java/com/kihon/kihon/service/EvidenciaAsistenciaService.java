package com.kihon.kihon.service;

import com.kihon.kihon.model.EvidenciaAsistencia;
import com.kihon.kihon.model.JustificacionAsistencia;
import com.kihon.kihon.repository.EvidenciaAsistenciaRepository;
import com.kihon.kihon.repository.JustificacionAsistenciaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class EvidenciaAsistenciaService {

    private static final int MIN_SEGUNDOS_URL = 60;
    private static final int MAX_SEGUNDOS_URL = 3600;

    private final EvidenciaAsistenciaRepository evidenciaRepository;
    private final JustificacionAsistenciaRepository justificacionRepository;
    private final SupabaseStorageService supabaseStorageService;

    public EvidenciaAsistenciaService(
            EvidenciaAsistenciaRepository evidenciaRepository,
            JustificacionAsistenciaRepository justificacionRepository,
            SupabaseStorageService supabaseStorageService) {

        this.evidenciaRepository = evidenciaRepository;
        this.justificacionRepository = justificacionRepository;
        this.supabaseStorageService = supabaseStorageService;
    }

    // ==========================================
    // SUBIR EVIDENCIA
    // ==========================================

    @Transactional
    public EvidenciaAsistencia subirEvidencia(
            Long justificacionId,
            MultipartFile archivo) {

        if (justificacionId == null) {

            throw new RuntimeException(
                    "La justificación es obligatoria");
        }

        JustificacionAsistencia justificacion = justificacionRepository.findById(justificacionId)
                .orElseThrow(() -> new RuntimeException(
                        "La justificación no existe"));

        if (archivo == null || archivo.isEmpty()) {

            throw new RuntimeException(
                    "El archivo está vacío");
        }

        String nombreOriginal = archivo.getOriginalFilename();

        if (nombreOriginal == null
                || nombreOriginal.isBlank()) {

            throw new RuntimeException(
                    "El archivo no tiene un nombre válido");
        }

        /*
         * Conservamos el nombre original para mostrarlo
         * al usuario.
         */
        String nombreArchivo = obtenerNombreSeguro(nombreOriginal);

        String tipoMime = archivo.getContentType();

        if (tipoMime == null
                || tipoMime.isBlank()) {

            throw new RuntimeException(
                    "No se pudo determinar el tipo del archivo");
        }

        /*
         * Primero creamos el registro para obtener
         * su ID.
         */
        EvidenciaAsistencia evidencia = new EvidenciaAsistencia();

        evidencia.setJustificacion(justificacion);
        evidencia.setNombreArchivo(nombreArchivo);
        evidencia.setTipoMime(tipoMime);
        evidencia.setFechaSubida(LocalDateTime.now());
        evidencia.setRutaArchivo("PENDIENTE");

        evidencia = evidenciaRepository.save(evidencia);

        /*
         * La ruta física de Storage no utiliza
         * directamente el nombre original.
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
             * Si Storage falló, intentamos eliminar
             * cualquier archivo que pudiera haberse creado.
             */
            try {

                supabaseStorageService
                        .eliminarEvidencia(ruta);

            } catch (Exception ignored) {
            }

            /*
             * También eliminamos el registro temporal.
             */
            evidenciaRepository.delete(evidencia);

            throw new RuntimeException(
                    "No se pudo subir la evidencia",
                    e);
        }
    }

    // ==========================================
    // LISTAR POR JUSTIFICACIÓN
    // ==========================================

    public List<EvidenciaAsistencia> listarPorJustificacion(
            Long justificacionId) {

        if (justificacionId == null) {

            throw new RuntimeException(
                    "La justificación es obligatoria");
        }

        if (!justificacionRepository.existsById(
                justificacionId)) {

            throw new RuntimeException(
                    "La justificación no existe");
        }

        return evidenciaRepository
                .findByJustificacionId(justificacionId);
    }

    // ==========================================
    // BUSCAR POR ID
    // ==========================================

    public EvidenciaAsistencia buscarPorId(
            Long id) {

        if (id == null) {

            throw new RuntimeException(
                    "El ID de la evidencia es obligatorio");
        }

        return evidenciaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "La evidencia no existe"));
    }

    // ==========================================
    // GENERAR URL FIRMADA
    // ==========================================

    public String generarUrlFirmada(
            Long id,
            int segundos) {

        if (segundos < MIN_SEGUNDOS_URL
                || segundos > MAX_SEGUNDOS_URL) {

            throw new RuntimeException(
                    "La duración de la URL debe estar entre "
                            + MIN_SEGUNDOS_URL
                            + " y "
                            + MAX_SEGUNDOS_URL
                            + " segundos");
        }

        EvidenciaAsistencia evidencia = buscarPorId(id);

        if (evidencia.getRutaArchivo() == null
                || evidencia.getRutaArchivo().isBlank()
                || "PENDIENTE".equals(
                        evidencia.getRutaArchivo())) {

            throw new RuntimeException(
                    "La evidencia no tiene un archivo almacenado");
        }

        try {

            return supabaseStorageService
                    .generarUrlFirmadaEvidencia(
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

    @Transactional
    public void eliminarEvidencia(
            Long id) {

        EvidenciaAsistencia evidencia = buscarPorId(id);

        String ruta = evidencia.getRutaArchivo();

        try {

            if (ruta != null
                    && !ruta.isBlank()
                    && !"PENDIENTE".equals(ruta)) {

                supabaseStorageService
                        .eliminarEvidencia(ruta);
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
    // OBTENER NOMBRE SEGURO
    // ==========================================

    private String obtenerNombreSeguro(
            String nombreOriginal) {

        String nombre = nombreOriginal.trim();

        nombre = nombre.replace("\\", "/");

        int ultimaBarra = nombre.lastIndexOf("/");

        if (ultimaBarra >= 0) {

            nombre = nombre.substring(
                    ultimaBarra + 1);
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

    private String generarNombreStorage(
            String nombreArchivo) {

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