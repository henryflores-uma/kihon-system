package com.kihon.kihon.controller;

import com.kihon.kihon.dto.ReporteAsistenciaResponse;
import com.kihon.kihon.service.ReporteAsistenciaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reportes/asistencias")
public class ReporteAsistenciaController {

    private final ReporteAsistenciaService reporteAsistenciaService;

    public ReporteAsistenciaController(
            ReporteAsistenciaService reporteAsistenciaService) {

        this.reporteAsistenciaService = reporteAsistenciaService;
    }

    @GetMapping("/diario")
    public ReporteAsistenciaResponse reporteDiario(
            @RequestParam LocalDate fecha) {

        return reporteAsistenciaService.generarReporteDiario(
                fecha);
    }

    @GetMapping("/semanal")
    public ReporteAsistenciaResponse reporteSemanal(
            @RequestParam LocalDate inicio,
            @RequestParam LocalDate fin) {

        return reporteAsistenciaService.generarReporteSemanal(
                inicio,
                fin);
    }

    @GetMapping("/mensual")
    public ReporteAsistenciaResponse reporteMensual(
            @RequestParam int anio,
            @RequestParam int mes) {

        return reporteAsistenciaService.generarReporteMensual(
                anio,
                mes);
    }

    @GetMapping("/estudiante/{estudianteId}")
    public ReporteAsistenciaResponse reportePorEstudiante(
            @PathVariable Long estudianteId) {

        return reporteAsistenciaService.generarReportePorEstudiante(
                estudianteId);
    }

    @GetMapping("/grupo/{grupoId}")
    public ReporteAsistenciaResponse reportePorGrupo(
            @PathVariable Long grupoId) {

        return reporteAsistenciaService.generarReportePorGrupo(
                grupoId);
    }
}