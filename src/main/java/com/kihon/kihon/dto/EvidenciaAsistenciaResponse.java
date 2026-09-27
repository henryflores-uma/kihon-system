package com.kihon.kihon.dto;

import java.time.LocalDateTime;

public class EvidenciaAsistenciaResponse {

    private Long id;
    private Long justificacionId;
    private String nombreArchivo;
    private String tipoMime;
    private LocalDateTime fechaSubida;

    public EvidenciaAsistenciaResponse() {
    }

    public EvidenciaAsistenciaResponse(
            Long id,
            Long justificacionId,
            String nombreArchivo,
            String tipoMime,
            LocalDateTime fechaSubida) {

        this.id = id;
        this.justificacionId = justificacionId;
        this.nombreArchivo = nombreArchivo;
        this.tipoMime = tipoMime;
        this.fechaSubida = fechaSubida;
    }

    public Long getId() {
        return id;
    }

    public Long getJustificacionId() {
        return justificacionId;
    }

    public String getNombreArchivo() {
        return nombreArchivo;
    }

    public String getTipoMime() {
        return tipoMime;
    }

    public LocalDateTime getFechaSubida() {
        return fechaSubida;
    }
}