package com.kihon.kihon.service;

import com.kihon.kihon.config.SupabaseConfig;

import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class SupabaseStorageService {

    private final SupabaseConfig supabaseConfig;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    private static final String BUCKET = "estudiantes-fotos";

    public SupabaseStorageService(
            SupabaseConfig supabaseConfig) {

        this.supabaseConfig = supabaseConfig;
    }

    /*
     * ==========================================
     * SUBIR FOTOGRAFÍA
     * ==========================================
     */

    public String subirFoto(

            MultipartFile archivo,

            String ruta)

            throws IOException, InterruptedException {

        if (archivo == null
                || archivo.isEmpty()) {

            throw new RuntimeException(
                    "El archivo está vacío");
        }

        String tipoContenido = archivo.getContentType();

        if (tipoContenido == null
                || !tipoContenido
                        .startsWith("image/")) {

            throw new RuntimeException(
                    "El archivo debe ser una imagen");
        }

        String rutaCodificada = ruta.replace("/", "%2F");

        String url = supabaseConfig.getUrl()

                + "/storage/v1/object/"

                + BUCKET

                + "/"

                + rutaCodificada;

        HttpRequest request = HttpRequest.newBuilder()

                .uri(URI.create(url))

                .header(
                        HttpHeaders.AUTHORIZATION,
                        "Bearer "
                                + supabaseConfig
                                        .getSecretKey())

                .header(
                        "apikey",
                        supabaseConfig
                                .getSecretKey())

                .header(
                        HttpHeaders.CONTENT_TYPE,
                        tipoContenido)

                .header(
                        "x-upsert",
                        "true")

                .PUT(
                        HttpRequest.BodyPublishers
                                .ofByteArray(
                                        archivo
                                                .getBytes()))

                .build();

        HttpResponse<String> response = httpClient.send(
                request,
                HttpResponse.BodyHandlers
                        .ofString());

        if (response.statusCode() < 200
                || response.statusCode() >= 300) {

            throw new RuntimeException(
                    "Error al subir la imagen a Supabase Storage. "
                            + "Código: "
                            + response.statusCode()
                            + " - "
                            + response.body());
        }

        return ruta;
    }

    /*
     * ==========================================
     * GENERAR URL FIRMADA
     * ==========================================
     */

    public String generarUrlFirmada(

            String ruta,

            int segundos)

            throws IOException, InterruptedException {

        if (ruta == null
                || ruta.isBlank()) {

            throw new RuntimeException(
                    "La ruta de la imagen está vacía");
        }

        if (segundos <= 0) {

            throw new RuntimeException(
                    "El tiempo de expiración debe ser mayor a cero");
        }

        /*
         * IMPORTANTE:
         *
         * Aquí NO codificamos las barras "/".
         * Supabase necesita recibir:
         *
         * estudiantes/3/perfil.jpg
         */

        String url = supabaseConfig.getUrl()

                + "/storage/v1/object/sign/"

                + BUCKET

                + "/"

                + ruta;

        String body = "{\"expiresIn\":"
                + segundos
                + "}";

        HttpRequest request = HttpRequest.newBuilder()

                .uri(URI.create(url))

                .header(
                        HttpHeaders.AUTHORIZATION,
                        "Bearer "
                                + supabaseConfig
                                        .getSecretKey())

                .header(
                        "apikey",
                        supabaseConfig
                                .getSecretKey())

                .header(
                        HttpHeaders.CONTENT_TYPE,
                        "application/json")

                .POST(
                        HttpRequest.BodyPublishers
                                .ofString(
                                        body))

                .build();

        HttpResponse<String> response = httpClient.send(
                request,
                HttpResponse.BodyHandlers
                        .ofString());

        if (response.statusCode() < 200
                || response.statusCode() >= 300) {

            throw new RuntimeException(
                    "Error al generar la URL firmada. "
                            + "Código: "
                            + response.statusCode()
                            + " - "
                            + response.body());
        }

        String respuesta = response.body();

        String marcador = "\"signedURL\":\"";

        int inicio = respuesta.indexOf(
                marcador);

        if (inicio == -1) {

            throw new RuntimeException(
                    "Supabase no devolvió una URL firmada");
        }

        inicio += marcador.length();

        int fin = respuesta.indexOf(
                "\"",
                inicio);

        if (fin == -1) {

            throw new RuntimeException(
                    "Respuesta inválida de Supabase");
        }

        String signedPath = respuesta.substring(
                inicio,
                fin);

        return supabaseConfig.getUrl()

                + "/storage/v1"

                + signedPath;
    }

    /*
     * ==========================================
     * ELIMINAR FOTOGRAFÍA
     * ==========================================
     */

    public void eliminarFoto(

            String ruta)

            throws IOException, InterruptedException {

        if (ruta == null
                || ruta.isBlank()) {

            return;
        }

        String rutaCodificada = ruta.replace("/", "%2F");

        String url = supabaseConfig.getUrl()

                + "/storage/v1/object/"

                + BUCKET

                + "/"

                + rutaCodificada;

        HttpRequest request = HttpRequest.newBuilder()

                .uri(URI.create(url))

                .header(
                        HttpHeaders.AUTHORIZATION,
                        "Bearer "
                                + supabaseConfig
                                        .getSecretKey())

                .header(
                        "apikey",
                        supabaseConfig
                                .getSecretKey())

                .DELETE()

                .build();

        HttpResponse<String> response = httpClient.send(
                request,
                HttpResponse.BodyHandlers
                        .ofString());

        if (response.statusCode() < 200
                || response.statusCode() >= 300) {

            throw new RuntimeException(
                    "Error al eliminar la fotografía de Supabase Storage. "
                            + "Código: "
                            + response.statusCode()
                            + " - "
                            + response.body());
        }
    }
}