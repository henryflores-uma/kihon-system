package com.kihon.kihon.dto;

public class EstudianteGrupoRequest {

    private Long estudianteId;
    private Long grupoId;

    public EstudianteGrupoRequest() {
    }

    public Long getEstudianteId() {
        return estudianteId;
    }

    public void setEstudianteId(Long estudianteId) {
        this.estudianteId = estudianteId;
    }

    public Long getGrupoId() {
        return grupoId;
    }

    public void setGrupoId(Long grupoId) {
        this.grupoId = grupoId;
    }
}