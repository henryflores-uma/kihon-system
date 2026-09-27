package com.kihon.kihon.dto;

public class MotivoJustificacionResponse {

    private Long id;
    private String nombre;

    public MotivoJustificacionResponse() {
    }

    public MotivoJustificacionResponse(
            Long id,
            String nombre) {

        this.id = id;
        this.nombre = nombre;
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }
}