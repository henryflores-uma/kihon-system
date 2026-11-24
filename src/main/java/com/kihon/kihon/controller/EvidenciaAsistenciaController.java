
package com.kihon.kihon.controller;

import com.kihon.kihon.dto.EvidenciaAsistenciaResponse;
import com.kihon.kihon.dto.EvidenciaAsistenciaUrlResponse;
import com.kihon.kihon.model.EvidenciaAsistencia;
import com.kihon.kihon.service.EvidenciaAsistenciaService;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/evidencias-asistencia")
public class EvidenciaAsistenciaController {

        private final EvidenciaAsistenciaService evidenciaService;

        public EvidenciaAsistenciaController(
                        EvidenciaAsistenciaService evidenciaService) {

                this.evidenciaService = evidenciaService;
        }

        /*
         * =========================================================
         * SUBIR EVIDENCIA
         * =========================================================
         */

        @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<EvidenciaAsistenciaResponse> subir(
                        @RequestParam Long justificacionId,
                        @RequestParam MultipartFile archivo,
                        Authentication authentication) {

                EvidenciaAsistencia evidencia = evidenciaService.subirEvidencia(
                                justificacionId,
                                archivo,
                                authentication.getName());

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(convertirAResponse(evidencia));
        }

        /*
         * =========================================================
         * LISTAR POR JUSTIFICACIÓN
         * =========================================================
         */

        @GetMapping("/justificacion/{justificacionId}")
        public ResponseEntity<List<EvidenciaAsistenciaResponse>> listarPorJustificacion(
                        @PathVariable Long justificacionId,
                        Authentication authentication) {

                List<EvidenciaAsistenciaResponse> response = evidenciaService
                                .listarPorJustificacion(
                                                justificacionId,
                                                authentication.getName())
                                .stream()
                                .map(this::convertirAResponse)
                                .toList();

                return ResponseEntity.ok(response);
        }

        /*
         * =========================================================
         * GENERAR URL FIRMADA
         * =========================================================
         */

        @GetMapping("/{id}/url")
        public ResponseEntity<EvidenciaAsistenciaUrlResponse> generarUrl(
                        @PathVariable Long id,
                        @RequestParam(defaultValue = "300") int segundos,
                        Authentication authentication) {

                EvidenciaAsistencia evidencia = evidenciaService.buscarPorId(
                                id,
                                authentication.getName());

                String url = evidenciaService.generarUrlFirmada(
                                id,
                                segundos,
                                authentication.getName());

                EvidenciaAsistenciaUrlResponse response = new EvidenciaAsistenciaUrlResponse(
                                evidencia.getId(),
                                evidencia.getNombreArchivo(),
                                evidencia.getTipoMime(),
                                url);

                return ResponseEntity.ok(response);
        }

        /*
         * =========================================================
         * ELIMINAR
         * =========================================================
         */

        @DeleteMapping("/{id}")
        public ResponseEntity<Void> eliminar(
                        @PathVariable Long id,
                        Authentication authentication) {

                evidenciaService.eliminarEvidencia(
                                id,
                                authentication.getName());

                return ResponseEntity.noContent().build();
        }

        /*
         * =========================================================
         * CONVERTIR A RESPONSE
         * =========================================================
         */

        private EvidenciaAsistenciaResponse convertirAResponse(
                        EvidenciaAsistencia evidencia) {

                return new EvidenciaAsistenciaResponse(
                                evidencia.getId(),
                                evidencia.getJustificacion().getId(),
                                evidencia.getNombreArchivo(),
                                evidencia.getTipoMime(),
                                evidencia.getFechaSubida());
        }
}
