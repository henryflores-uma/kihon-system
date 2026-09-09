package com.kihon.kihon.dto;

import java.time.LocalTime;

public class GrupoEstudianteResponse {

    private Long id;
    private String nombre;
    private String descripcion;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private String estado;

    public GrupoEstudianteResponse(
            Long id,
            String nombre,
            String descripcion,
            LocalTime horaInicio,
            LocalTime horaFin,
            String estado) {

        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
        this.estado = estado;
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public LocalTime getHoraInicio() {
        return horaInicio;
    }

    public LocalTime getHoraFin() {
        return horaFin;
    }

    public String getEstado() {
        return estado;
    }
}