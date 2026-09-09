package com.kihon.kihon.dto;

import java.time.LocalDate;
import java.util.List;

public class ReporteAsistenciaResponse {

    private LocalDate fechaInicio;
    private LocalDate fechaFin;

    private int total;
    private int presentes;
    private int tardanzas;
    private int ausentes;

    private double porcentajeAsistencia;

    private List<AsistenciaResponse> asistencias;

    public ReporteAsistenciaResponse(
            LocalDate fechaInicio,
            LocalDate fechaFin,
            int total,
            int presentes,
            int tardanzas,
            int ausentes,
            double porcentajeAsistencia,
            List<AsistenciaResponse> asistencias) {

        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.total = total;
        this.presentes = presentes;
        this.tardanzas = tardanzas;
        this.ausentes = ausentes;
        this.porcentajeAsistencia = porcentajeAsistencia;
        this.asistencias = asistencias;
    }

    public LocalDate getFechaInicio() {
        return fechaInicio;
    }

    public LocalDate getFechaFin() {
        return fechaFin;
    }

    public int getTotal() {
        return total;
    }

    public int getPresentes() {
        return presentes;
    }

    public int getTardanzas() {
        return tardanzas;
    }

    public int getAusentes() {
        return ausentes;
    }

    public double getPorcentajeAsistencia() {
        return porcentajeAsistencia;
    }

    public List<AsistenciaResponse> getAsistencias() {
        return asistencias;
    }
}