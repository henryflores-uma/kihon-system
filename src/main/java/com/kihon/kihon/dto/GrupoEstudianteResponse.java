package com.kihon.kihon.dto;

import java.time.LocalTime;
import java.util.List;

public class GrupoEstudianteResponse {

    private Long id;
    private String nombre;
    private String descripcion;
    private List<HorarioResponse> horarios;
    private String estado;

    public GrupoEstudianteResponse(
            Long id,
            String nombre,
            String descripcion,
            List<HorarioResponse> horarios,
            String estado) {

        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.horarios = horarios;
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

    public List<HorarioResponse> getHorarios() {
        return horarios;
    }

    public String getEstado() {
        return estado;
    }

    public record HorarioResponse(
            String diaSemana,
            LocalTime horaInicio,
            LocalTime horaFin) {
    }
}