package com.kihon.kihon.controller;

import com.kihon.kihon.model.EstudianteApoderado;
import com.kihon.kihon.service.ApoderadoService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/apoderados")
public class ApoderadoController {

    private final ApoderadoService apoderadoService;

    public ApoderadoController(
            ApoderadoService apoderadoService) {

        this.apoderadoService = apoderadoService;
    }

    /*
     * ==========================================
     * CREAR / VINCULAR APODERADO
     * ==========================================
     */

    @PostMapping("/estudiante/{estudianteId}")
    public ResponseEntity<EstudianteApoderado> crearApoderado(

            @PathVariable Long estudianteId,

            @RequestParam String nombre,

            @RequestParam String apellido,

            @RequestParam String tipoDocumento,

            @RequestParam String documento,

            @RequestParam String telefono,

            @RequestParam(required = false) String correo,

            @RequestParam String direccion,

            @RequestParam String parentesco) {

        EstudianteApoderado relacion = apoderadoService.crearApoderado(

                estudianteId,

                nombre,

                apellido,

                tipoDocumento,

                documento,

                telefono,

                correo,

                direccion,

                parentesco);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(relacion);
    }

    /*
     * ==========================================
     * LISTAR APODERADOS DE UN ESTUDIANTE
     * ==========================================
     */

    @GetMapping("/estudiante/{estudianteId}")
    public ResponseEntity<List<EstudianteApoderado>> listarPorEstudiante(

            @PathVariable Long estudianteId) {

        List<EstudianteApoderado> relaciones = apoderadoService
                .listarPorEstudiante(
                        estudianteId);

        return ResponseEntity.ok(
                relaciones);
    }
}