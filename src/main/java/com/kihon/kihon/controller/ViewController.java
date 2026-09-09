package com.kihon.kihon.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/dashboard")
    public String dashboard() {
        return "dashboard";
    }

    @GetMapping("/estudiantes")
    public String estudiantes() {
        return "estudiantes";
    }

    @GetMapping ("/grupos")
    public String grupos() {
        return "grupos";
    }

    @GetMapping("/asistencias")
    public String asistencias() {
        return "asistencias";
    }

    @GetMapping("/reportes")
    public String reportes() {
        return "reportes";
    }
}