package com.kihon.kihon.dto;

public class EvidenciaAsistenciaUrlResponse {

    private Long id;
    private String nombreArchivo;
    private String tipoMime;
    private String url;

    public EvidenciaAsistenciaUrlResponse() {
    }

    public EvidenciaAsistenciaUrlResponse(
            Long id,
            String nombreArchivo,
            String tipoMime,
            String url) {

        this.id = id;
        this.nombreArchivo = nombreArchivo;
        this.tipoMime = tipoMime;
        this.url = url;
    }

    public Long getId() {
        return id;
    }

    public String getNombreArchivo() {
        return nombreArchivo;
    }

    public String getTipoMime() {
        return tipoMime;
    }

    public String getUrl() {
        return url;
    }
}