package com.kihon.kihon.dto;

public class GrupoRequest {
    private String nombre;
    private String descripcion;
    private Integer capacidad;
    private Long senseiId;
    private Long frecuenciaId;

    public GrupoRequest() {
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Integer getCapacidad() {
        return capacidad;
    }

    public void setCapacidad(Integer capacidad) {
        this.capacidad = capacidad;
    }

    public Long getSenseiId() {
        return senseiId;
    }

    public void setSenseiId(Long senseiId) {
        this.senseiId = senseiId;
    }

    public Long getFrecuenciaId() {
        return frecuenciaId;
    }

    public void setFrecuenciaId(Long frecuenciaId) {
        this.frecuenciaId = frecuenciaId;
    }
}