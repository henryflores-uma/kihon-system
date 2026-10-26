package com.kihon.kihon.dto;

import java.time.LocalDateTime;

public class JustificacionAsistenciaResponse {

    private Long id;
    private Long asistenciaId;
    private Long motivoId;
    private String motivoNombre;
    private String descripcion;
    private LocalDateTime fechaRegistro;
    private Long registradoPorId;
    private String registradoPorNombre;

    public JustificacionAsistenciaResponse() {
    }

    public JustificacionAsistenciaResponse(
            Long id,
            Long asistenciaId,
            Long motivoId,
            String motivoNombre,
            String descripcion,
            LocalDateTime fechaRegistro,
            Long registradoPorId,
            String registradoPorNombre) {

        this.id = id;
        this.asistenciaId = asistenciaId;
        this.motivoId = motivoId;
        this.motivoNombre = motivoNombre;
        this.descripcion = descripcion;
        this.fechaRegistro = fechaRegistro;
        this.registradoPorId = registradoPorId;
        this.registradoPorNombre = registradoPorNombre;
    }

    public Long getId() {
        return id;
    }

    public Long getAsistenciaId() {
        return asistenciaId;
    }

    public Long getMotivoId() {
        return motivoId;
    }

    public String getMotivoNombre() {
        return motivoNombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }

    public Long getRegistradoPorId() {
        return registradoPorId;
    }

    public String getRegistradoPorNombre() {
        return registradoPorNombre;
    }
}