package com.kihon.kihon.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {

    // ==========================================
    // PÁGINAS PÚBLICAS
    // ==========================================

    @GetMapping("/")
    public String index() {
        return "index";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/registro")
    public String registro() {
        return "registro";
    }

    // ==========================================
    // ADMIN
    // ==========================================

    @GetMapping("/admin/admin")
    public String admin() {
        return "admin/admin";
    }

    @GetMapping("/admin/estudiantes")
    public String estudiantes() {
        return "admin/estudiantes";
    }

    @GetMapping("/admin/grupos")
    public String grupos(Model model) {
        configurarVistaGrupos(
                model,
                "admin",
                "Administrador",
                false);

        return "admin/grupos";
    }

    @GetMapping("/admin/asistencia")
    public String asistencia() {
        return "admin/asistencia";
    }

    @GetMapping("/admin/horario")
    public String horario() {
        return "admin/horario";
    }

    @GetMapping("/admin/inscripciones")
    public String inscripciones() {
        return "admin/inscripciones";
    }

    @GetMapping("/admin/reportes")
    public String reportes(Model model) {
        configurarVistaReportes(
                model,
                "admin",
                "Administrador");

        return "admin/reportes";
    }

    @GetMapping("/admin/usuarios")
    public String usuarios() {
        return "admin/usuarios";
    }

    @GetMapping("/admin/perfil")
    public String perfilAdmin() {
        return "admin/perfil";
    }

    // ==========================================
    // SECRETARÍA
    // ==========================================

    @GetMapping("/secretaria/secretaria")
    public String secretaria() {
        return "secretaria/secretaria";
    }

    // Vistas compartidas con ADMIN

    @GetMapping("/secretaria/estudiantes")
    public String estudiantesSecretaria() {
        return "admin/estudiantes";
    }

    @GetMapping("/secretaria/grupos")
    public String gruposSecretaria(Model model) {
        configurarVistaGrupos(
                model,
                "secretaria",
                "Secretaría",
                false);

        return "admin/grupos";
    }

    @GetMapping("/secretaria/asistencia")
    public String asistenciaSecretaria() {
        return "admin/asistencia";
    }

    @GetMapping("/secretaria/horario")
    public String horarioSecretaria() {
        return "admin/horario";
    }

    @GetMapping("/secretaria/inscripciones")
    public String inscripcionesSecretaria() {
        return "admin/inscripciones";
    }

    @GetMapping("/secretaria/reportes")
    public String reportesSecretaria(Model model) {
        configurarVistaReportes(
                model,
                "secretaria",
                "Secretaría");

        return "admin/reportes";
    }

    @GetMapping("/secretaria/perfil")
    public String perfilSecretaria() {
        return "admin/perfil";
    }

    // ==========================================
    // SENSEI
    // ==========================================

    @GetMapping("/sensei/sensei")
    public String sensei() {
        return "sensei/sensei";
    }

    @GetMapping("/sensei/grupos")
    public String gruposSensei(Model model) {
        configurarVistaGrupos(
                model,
                "sensei",
                "Sensei",
                true);

        return "admin/grupos";
    }

    @GetMapping("/sensei/estudiantes")
    public String estudiantesSensei() {
        return "admin/estudiantes";
    }

    @GetMapping("/sensei/asistencias")
    public String asistenciasSensei() {
        return "admin/asistencia";
    }

    @GetMapping("/sensei/horario")
    public String horarioSensei() {
        return "admin/horario";
    }

    @GetMapping("/sensei/reportes")
    public String reportesSensei(Model model) {
        configurarVistaReportes(
                model,
                "sensei",
                "Sensei");

        return "admin/reportes";
    }

    @GetMapping("/sensei/perfil")
    public String perfilSensei() {
        return "admin/perfil";
    }

    // ==========================================
    // ESTUDIANTE
    // ==========================================

    @GetMapping("/estudiante/estudiante")
    public String dashboardEstudiante() {
        return "estudiante/estudiante";
    }

    @GetMapping("/estudiante/perfil")
    public String perfilEstudiante() {
        return "admin/perfil";
    }

    @GetMapping("/estudiante/grupos")
    public String gruposEstudiante() {
        return "estudiante/grupos";
    }

    @GetMapping("/estudiante/asistencias")
    public String asistenciasEstudiante() {
        return "estudiante/asistencias";
    }

    @GetMapping("/estudiante/horario")
    public String horarioEstudiante() {
        return "estudiante/horario";
    }

    // ==========================================
    // CONFIGURACIÓN DE VISTA DE GRUPOS
    // ==========================================

    private void configurarVistaGrupos(
            Model model,
            String rutaBase,
            String rolDisplay,
            boolean esSensei) {

        model.addAttribute("rutaBase", "/" + rutaBase);
        model.addAttribute("rolDisplay", rolDisplay);
        model.addAttribute("esSensei", esSensei);
        model.addAttribute("puedeGestionarGrupos", !esSensei);

        model.addAttribute(
                "dashboardUrl",
                "/" + rutaBase + "/" + rutaBase);

        model.addAttribute(
                "perfilUrl",
                "/" + rutaBase + "/perfil");

        model.addAttribute(
                "scriptGrupos",
                esSensei
                        ? "/js/sensei-grupos.js"
                        : "/js/grupos.js");
    }

    // ==========================================
    // CONFIGURACIÓN DE VISTA DE REPORTES
    // ==========================================

    private void configurarVistaReportes(
            Model model,
            String rutaBase,
            String rolDisplay) {

        model.addAttribute("rutaBase", "/" + rutaBase);
        model.addAttribute("rolDisplay", rolDisplay);

        model.addAttribute(
                "dashboardUrl",
                "/" + rutaBase + "/" + rutaBase);

        model.addAttribute(
                "perfilUrl",
                "/" + rutaBase + "/perfil");

        model.addAttribute(
                "scriptReportes",
                "/js/reportes.js");
    }
}
