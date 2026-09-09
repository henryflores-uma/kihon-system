package com.kihon.kihon.dto;

public class EstudianteGrupoResponse {

    private Long id;

    private Long estudianteId;
    private String estudianteNombre;

    private Long grupoId;
    private String grupoNombre;

    private String estado;

    public EstudianteGrupoResponse() {
    }

    public EstudianteGrupoResponse(
            Long id,
            Long estudianteId,
            String estudianteNombre,
            Long grupoId,
            String grupoNombre,
            String estado) {

        this.id = id;
        this.estudianteId = estudianteId;
        this.estudianteNombre = estudianteNombre;
        this.grupoId = grupoId;
        this.grupoNombre = grupoNombre;
        this.estado = estado;
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
}