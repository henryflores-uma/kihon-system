package com.kihon.kihon.dto;

import java.time.LocalDateTime;

public class EstudianteGrupoResponse {

    private Long id;

    private Long estudianteId;
    private String estudianteNombre;

    private Long grupoId;
    private String grupoNombre;

    private String estado;

    private LocalDateTime fechaInscripcion;

    public EstudianteGrupoResponse() {
    }

    public EstudianteGrupoResponse(
            Long id,
            Long estudianteId,
            String estudianteNombre,
            Long grupoId,
            String grupoNombre,
            String estado,
            LocalDateTime fechaInscripcion) {

        this.id = id;
        this.estudianteId = estudianteId;
        this.estudianteNombre = estudianteNombre;
        this.grupoId = grupoId;
        this.grupoNombre = grupoNombre;
        this.estado = estado;
        this.fechaInscripcion = fechaInscripcion;
    }

    public Long getId() {
        return id;
    }

    public Long getEstudianteId() {
        return estudianteId;
    }

    public String getEstudianteNombre() {
        return estudianteNombre;
    }

    public Long getGrupoId() {
        return grupoId;
    }

    public String getGrupoNombre() {
        return grupoNombre;
    }

    public String getEstado() {
        return estado;
    }

    public LocalDateTime getFechaInscripcion() {
        return fechaInscripcion;
    }
}