package com.kihon.kihon.dto;

public class FrecuenciaGrupoResponse {

    private Long id;
    private String nombre;
    private Integer frecuenciaSemanal;

    public FrecuenciaGrupoResponse(
            Long id,
            String nombre,
            Integer frecuenciaSemanal) {

        this.id = id;
        this.nombre = nombre;
        this.frecuenciaSemanal = frecuenciaSemanal;
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public Integer getFrecuenciaSemanal() {
        return frecuenciaSemanal;
    }
}