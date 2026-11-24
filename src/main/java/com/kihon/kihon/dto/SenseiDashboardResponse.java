package com.kihon.kihon.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record SenseiDashboardResponse(

        LocalDate fecha,

        int totalGrupos,

        int totalEstudiantes,

        int totalClasesHoy,

        int totalAsistenciasHoy,

        int presentesHoy,

        int ausentesHoy,

        int tardanzasHoy,

        int justificadosHoy,

        List<GrupoResumenResponse> grupos,

        List<ClaseHoyResponse> clasesHoy

) {

    public record GrupoResumenResponse(

            Long grupoId,

            String nombre,

            int estudiantesActivos

    ) {
    }

    public record ClaseHoyResponse(

            Long horarioId,

            Long grupoId,

            String nombreGrupo,

            LocalTime horaInicio,

            LocalTime horaFin,

            int estudiantesActivos,

            int asistenciasRegistradas

    ) {
    }
}