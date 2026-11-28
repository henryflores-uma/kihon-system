
package com.kihon.kihon.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kihon.kihon.config.SupabaseConfig;

import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class SupabaseStorageService {

        private final SupabaseConfig supabaseConfig;

        private final HttpClient httpClient = HttpClient.newHttpClient();

        private final ObjectMapper objectMapper = new ObjectMapper();

        private static final String BUCKET_FOTOS = "estudiantes-fotos";

        private static final String BUCKET_EVIDENCIAS = "evidencias-asistencia";

        public SupabaseStorageService(SupabaseConfig supabaseConfig) {
                this.supabaseConfig = supabaseConfig;
        }

        // =========================================================
        // FOTOS
        // =========================================================

        public String subirFoto(
                        MultipartFile archivo,
                        String ruta) throws IOException, InterruptedException {

                if (archivo == null || archivo.isEmpty()) {
                        throw new RuntimeException("El archivo está vacío");
                }

                String tipoContenido = archivo.getContentType();

                if (tipoContenido == null
                                || !tipoContenido.startsWith("image/")) {

                        throw new RuntimeException(
                                        "El archivo debe ser una imagen");
                }

                validarRuta(ruta);

                String rutaCodificada = codificarRuta(ruta);

                String url = supabaseConfig.getUrl()
                                + "/storage/v1/object/"
                                + BUCKET_FOTOS
                                + "/"
                                + rutaCodificada;

                HttpRequest request = HttpRequest.newBuilder()
                                .uri(URI.create(url))
                                .header(
                                                HttpHeaders.AUTHORIZATION,
                                                "Bearer " + supabaseConfig.getSecretKey())
                                .header(
                                                "apikey",
                                                supabaseConfig.getSecretKey())
                                .header(
                                                HttpHeaders.CONTENT_TYPE,
                                                tipoContenido)
                                .header(
                                                "x-upsert",
                                                "true")
                                .PUT(
                                                HttpRequest.BodyPublishers.ofByteArray(
                                                                archivo.getBytes()))
                                .build();

                HttpResponse<String> response = httpClient.send(
                                request,
                                HttpResponse.BodyHandlers.ofString());

                validarRespuesta(
                                response,
                                "Error al subir la foto a Supabase Storage");

                return ruta;
        }

        public String generarUrlFirmada(
                        String ruta,
                        int segundos) throws IOException, InterruptedException {

                return generarUrlFirmadaBucket(
                                BUCKET_FOTOS,
                                ruta,
                                segundos);
        }

        public void eliminarFoto(
                        String ruta) throws IOException, InterruptedException {

                eliminarArchivoBucket(
                                BUCKET_FOTOS,
                                ruta);
        }

        // =========================================================
        // EVIDENCIAS DE ASISTENCIA
        // =========================================================

        public String subirEvidencia(
                        MultipartFile archivo,
                        String ruta) throws IOException, InterruptedException {

                if (archivo == null || archivo.isEmpty()) {
                        throw new RuntimeException("El archivo está vacío");
                }

                String tipoContenido = archivo.getContentType();

                if (tipoContenido == null || tipoContenido.isBlank()) {
                        throw new RuntimeException(
                                        "No se pudo determinar el tipo del archivo");
                }

                validarRuta(ruta);

                String rutaCodificada = codificarRuta(ruta);

                String url = supabaseConfig.getUrl()
                                + "/storage/v1/object/"
                                + BUCKET_EVIDENCIAS
                                + "/"
                                + rutaCodificada;

                HttpRequest request = HttpRequest.newBuilder()
                                .uri(URI.create(url))
                                .header(
                                                HttpHeaders.AUTHORIZATION,
                                                "Bearer " + supabaseConfig.getSecretKey())
                                .header(
                                                "apikey",
                                                supabaseConfig.getSecretKey())
                                .header(
                                                HttpHeaders.CONTENT_TYPE,
                                                tipoContenido)
                                .header(
                                                "x-upsert",
                                                "false")
                                .PUT(
                                                HttpRequest.BodyPublishers.ofByteArray(
                                                                archivo.getBytes()))
                                .build();

                HttpResponse<String> response = httpClient.send(
                                request,
                                HttpResponse.BodyHandlers.ofString());

                validarRespuesta(
                                response,
                                "Error al subir la evidencia a Supabase Storage");

                return ruta;
        }

        public String generarUrlFirmadaEvidencia(
                        String ruta,
                        int segundos) throws IOException, InterruptedException {

                return generarUrlFirmadaBucket(
                                BUCKET_EVIDENCIAS,
                                ruta,
                                segundos);
        }

        public void eliminarEvidencia(
                        String ruta) throws IOException, InterruptedException {

                eliminarArchivoBucket(
                                BUCKET_EVIDENCIAS,
                                ruta);
        }

        // =========================================================
        // GENERACIÓN DE URL FIRMADA
        // =========================================================

        private String generarUrlFirmadaBucket(
                        String bucket,
                        String ruta,
                        int segundos) throws IOException, InterruptedException {

                validarRuta(ruta);

                if (segundos <= 0) {
                        throw new RuntimeException(
                                        "El tiempo de expiración debe ser mayor a cero");
                }

                String rutaCodificada = codificarRuta(ruta);

                String url = supabaseConfig.getUrl()
                                + "/storage/v1/object/sign/"
                                + bucket
                                + "/"
                                + rutaCodificada;

                String body = "{\"expiresIn\":" + segundos + "}";

                HttpRequest request = HttpRequest.newBuilder()
                                .uri(URI.create(url))
                                .header(
                                                HttpHeaders.AUTHORIZATION,
                                                "Bearer " + supabaseConfig.getSecretKey())
                                .header(
                                                "apikey",
                                                supabaseConfig.getSecretKey())
                                .header(
                                                HttpHeaders.CONTENT_TYPE,
                                                "application/json")
                                .POST(
                                                HttpRequest.BodyPublishers.ofString(body))
                                .build();

                HttpResponse<String> response = httpClient.send(
                                request,
                                HttpResponse.BodyHandlers.ofString());

                validarRespuesta(
                                response,
                                "Error al generar la URL firmada");

                // Interpretar la respuesta JSON de Supabase.
                JsonNode json = objectMapper.readTree(response.body());

                JsonNode signedURLNode = json.get("signedURL");

                if (signedURLNode == null
                                || signedURLNode.isNull()
                                || signedURLNode.asText().isBlank()) {

                        throw new RuntimeException(
                                        "Supabase no devolvió una URL firmada válida");
                }

                String signedPath = signedURLNode.asText();

                if (!signedPath.startsWith("/")) {
                        throw new RuntimeException(
                                        "Supabase devolvió una ruta de URL firmada inválida");
                }

                return supabaseConfig.getUrl()
                                + "/storage/v1"
                                + signedPath;
        }

        // =========================================================
        // ELIMINACIÓN DE ARCHIVOS
        // =========================================================

        private void eliminarArchivoBucket(
                        String bucket,
                        String ruta) throws IOException, InterruptedException {

                if (ruta == null || ruta.isBlank()) {
                        return;
                }

                String rutaCodificada = codificarRuta(ruta);

                String url = supabaseConfig.getUrl()
                                + "/storage/v1/object/"
                                + bucket
                                + "/"
                                + rutaCodificada;

                HttpRequest request = HttpRequest.newBuilder()
                                .uri(URI.create(url))
                                .header(
                                                HttpHeaders.AUTHORIZATION,
                                                "Bearer " + supabaseConfig.getSecretKey())
                                .header(
                                                "apikey",
                                                supabaseConfig.getSecretKey())
                                .DELETE()
                                .build();

                HttpResponse<String> response = httpClient.send(
                                request,
                                HttpResponse.BodyHandlers.ofString());

                validarRespuesta(
                                response,
                                "Error al eliminar el archivo de Supabase Storage");
        }

        // =========================================================
        // VALIDAR RESPUESTA HTTP
        // =========================================================

        private void validarRespuesta(
                        HttpResponse<String> response,
                        String mensaje) {

                if (response.statusCode() < 200
                                || response.statusCode() >= 300) {

                        throw new RuntimeException(
                                        mensaje
                                                        + ". Código: "
                                                        + response.statusCode()
                                                        + " - "
                                                        + response.body());
                }
        }

        // =========================================================
        // VALIDAR RUTA
        // =========================================================

        private void validarRuta(String ruta) {

                if (ruta == null || ruta.isBlank()) {
                        throw new RuntimeException(
                                        "La ruta del archivo está vacía");
                }
        }

        // =========================================================
        // CODIFICACIÓN DE RUTAS
        // =========================================================

        /**
         * Codifica cada segmento de la ruta individualmente.
         *
         * Ejemplo:
         *
         * justificaciones/1/archivo con espacio.pdf
         *
         * Resultado:
         *
         * justificaciones/1/archivo%20con%20espacio.pdf
         *
         * Las barras "/" se mantienen para conservar
         * la estructura de carpetas de Supabase Storage.
         */

        private String codificarRuta(String ruta) {

                String[] segmentos = ruta.split("/");

                StringBuilder resultado = new StringBuilder();

                for (int i = 0; i < segmentos.length; i++) {

                        if (i > 0) {
                                resultado.append("/");
                        }

                        resultado.append(
                                        URLEncoder.encode(
                                                        segmentos[i],
                                                        StandardCharsets.UTF_8).replace("+", "%20"));
                }

                return resultado.toString();
        }
}