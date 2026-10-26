package com.kihon.kihon.dto;

public class GrupoResponse {

    private Long id;
    private String nombre;
    private String descripcion;
    private Integer capacidad;
    private long estudiantesActivos;
    private long cuposDisponibles;
    private String estado;
    private Long senseiId;
    private String senseiNombre;
    private Long frecuenciaId;
    private String frecuenciaNombre;
    private Integer frecuenciaSemanal;

    public GrupoResponse() {
    }

    public GrupoResponse(
            Long id,
            String nombre,
            String descripcion,
            Integer capacidad,
            long estudiantesActivos,
            long cuposDisponibles,
            String estado,
            Long senseiId,
            String senseiNombre,
            Long frecuenciaId,
            String frecuenciaNombre,
            Integer frecuenciaSemanal) {

        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.capacidad = capacidad;
        this.estudiantesActivos = estudiantesActivos;
        this.cuposDisponibles = cuposDisponibles;
        this.estado = estado;
        this.senseiId = senseiId;
        this.senseiNombre = senseiNombre;
        this.frecuenciaId = frecuenciaId;
        this.frecuenciaNombre = frecuenciaNombre;
        this.frecuenciaSemanal = frecuenciaSemanal;
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

    public Long getFrecuenciaId() {
        return frecuenciaId;
    }

    public String getFrecuenciaNombre() {
        return frecuenciaNombre;
    }

    public Integer getFrecuenciaSemanal() {
        return frecuenciaSemanal;
    }
}