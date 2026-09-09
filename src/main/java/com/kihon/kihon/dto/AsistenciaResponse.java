package com.kihon.kihon.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class AsistenciaResponse {

    private Long id;
    private Long estudianteId;
    private String estudianteNombre;
    private Long grupoId;
    private String grupoNombre;
    private LocalDate fecha;
    private LocalTime horaLlegada;
    private String estado;
    private String observacion;

    public AsistenciaResponse() {
    }

    public AsistenciaResponse(
            Long id,
            Long estudianteId,
            String estudianteNombre,
            Long grupoId,
            String grupoNombre,
            LocalDate fecha,
            LocalTime horaLlegada,
            String estado,
            String observacion) {

        this.id = id;
        this.estudianteId = estudianteId;
        this.estudianteNombre = estudianteNombre;
        this.grupoId = grupoId;
        this.grupoNombre = grupoNombre;
        this.fecha = fecha;
        this.horaLlegada = horaLlegada;
        this.estado = estado;
        this.observacion = observacion;
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

    public LocalDate getFecha() {
        return fecha;
    }

    public LocalTime getHoraLlegada() {
        return horaLlegada;
    }

    public String getEstado() {
        return estado;
    }

    public String getObservacion() {
        return observacion;
    }
}