
package com.kihon.kihon.controller;

import com.kihon.kihon.dto.ReporteAsistenciaResponse;
import com.kihon.kihon.service.ReporteAsistenciaService;

import org.springframework.security.core.Authentication;
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

        /*
         * =========================================================
         * REPORTE DIARIO
         * =========================================================
         */

        @GetMapping("/diario")
        public ReporteAsistenciaResponse reporteDiario(
                        @RequestParam LocalDate fecha,
                        Authentication authentication) {

                return reporteAsistenciaService.generarReporteDiario(
                                fecha,
                                authentication.getName());
        }

        /*
         * =========================================================
         * REPORTE SEMANAL
         * =========================================================
         */

        @GetMapping("/semanal")
        public ReporteAsistenciaResponse reporteSemanal(
                        @RequestParam LocalDate inicio,
                        @RequestParam LocalDate fin,
                        Authentication authentication) {

                return reporteAsistenciaService.generarReporteSemanal(
                                inicio,
                                fin,
                                authentication.getName());
        }

        /*
         * =========================================================
         * REPORTE MENSUAL
         * =========================================================
         */

        @GetMapping("/mensual")
        public ReporteAsistenciaResponse reporteMensual(
                        @RequestParam int anio,
                        @RequestParam int mes,
                        Authentication authentication) {

                return reporteAsistenciaService.generarReporteMensual(
                                anio,
                                mes,
                                authentication.getName());
        }

        /*
         * =========================================================
         * REPORTE POR ESTUDIANTE
         * =========================================================
         */

        @GetMapping("/estudiante/{estudianteId}")
        public ReporteAsistenciaResponse reportePorEstudiante(
                        @PathVariable Long estudianteId,
                        Authentication authentication) {

                return reporteAsistenciaService.generarReportePorEstudiante(
                                estudianteId,
                                authentication.getName());
        }

        /*
         * =========================================================
         * REPORTE POR GRUPO
         * =========================================================
         */

        @GetMapping("/grupo/{grupoId}")
        public ReporteAsistenciaResponse reportePorGrupo(
                        @PathVariable Long grupoId,
                        Authentication authentication) {

                return reporteAsistenciaService.generarReportePorGrupo(
                                grupoId,
                                authentication.getName());
        }
}
