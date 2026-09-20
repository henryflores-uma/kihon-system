package com.kihon.kihon.dto;

import java.time.LocalTime;

public class GrupoResponse {

    private Long id;
    private String nombre;
    private String descripcion;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private Integer capacidad;
    private long estudiantesActivos;
    private long cuposDisponibles;
    private String estado;
    private Long senseiId;
    private String senseiNombre;

    public GrupoResponse() {
    }

    public GrupoResponse(
            Long id,
            String nombre,
            String descripcion,
            LocalTime horaInicio,
            LocalTime horaFin,
            Integer capacidad,
            long estudiantesActivos,
            long cuposDisponibles,
            String estado,
            Long senseiId,
            String senseiNombre) {

        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
        this.capacidad = capacidad;
        this.estudiantesActivos = estudiantesActivos;
        this.cuposDisponibles = cuposDisponibles;
        this.estado = estado;
        this.senseiId = senseiId;
        this.senseiNombre = senseiNombre;
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

    public Integer getCapacidad() {
        return capacidad;
    }

    public long getEstudiantesActivos() {
        return estudiantesActivos;
    }

    public long getCuposDisponibles() {
        return cuposDisponibles;
    }

    public String getEstado() {
        return estado;
    }

    public Long getSenseiId() {
        return senseiId;
    }

    public String getSenseiNombre() {
        return senseiNombre;
    }
}