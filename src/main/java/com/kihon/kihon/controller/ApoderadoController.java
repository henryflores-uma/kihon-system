
package com.kihon.kihon.controller;

import com.kihon.kihon.model.Apoderado;
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

        public ApoderadoController(ApoderadoService apoderadoService) {
                this.apoderadoService = apoderadoService;
        }

        /*
         * =========================================================
         * LISTAR TODOS LOS APODERADOS
         * GET /api/apoderados
         * =========================================================
         */

        @GetMapping
        public ResponseEntity<List<Apoderado>> listarTodos() {
                return ResponseEntity.ok(
                                apoderadoService.listarTodos());
        }

        /*
         * =========================================================
         * CONSULTAR UN APODERADO POR ID
         * GET /api/apoderados/{apoderadoId}
         * =========================================================
         */

        @GetMapping("/{apoderadoId}")
        public ResponseEntity<Apoderado> buscarPorId(
                        @PathVariable Long apoderadoId) {

                return ResponseEntity.ok(
                                apoderadoService.buscarPorId(apoderadoId));
        }

        /*
         * =========================================================
         * CREAR / VINCULAR APODERADO
         * POST /api/apoderados/estudiante/{estudianteId}
         * =========================================================
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
         * =========================================================
         * LISTAR APODERADOS DE UN ESTUDIANTE
         * GET /api/apoderados/estudiante/{estudianteId}
         * =========================================================
         */

        @GetMapping("/estudiante/{estudianteId}")
        public ResponseEntity<List<EstudianteApoderado>> listarPorEstudiante(
                        @PathVariable Long estudianteId) {

                return ResponseEntity.ok(
                                apoderadoService.listarPorEstudiante(estudianteId));
        }

        /*
         * =========================================================
         * LISTAR ESTUDIANTES VINCULADOS A UN APODERADO
         * GET /api/apoderados/{apoderadoId}/estudiantes
         * =========================================================
         */

        @GetMapping("/{apoderadoId}/estudiantes")
        public ResponseEntity<List<EstudianteApoderado>> listarEstudiantesPorApoderado(
                        @PathVariable Long apoderadoId) {

                return ResponseEntity.ok(
                                apoderadoService.listarEstudiantesPorApoderado(
                                                apoderadoId));
        }

        /*
         * =========================================================
         * ACTUALIZAR DATOS PERSONALES DEL APODERADO
         * PUT /api/apoderados/{apoderadoId}
         * =========================================================
         */

        @PutMapping("/{apoderadoId}")
        public ResponseEntity<Apoderado> actualizarApoderado(
                        @PathVariable Long apoderadoId,
                        @RequestParam String nombre,
                        @RequestParam String apellido,
                        @RequestParam String tipoDocumento,
                        @RequestParam String documento,
                        @RequestParam String telefono,
                        @RequestParam String correo,
                        @RequestParam String direccion) {

                Apoderado apoderado = apoderadoService.actualizarApoderado(
                                apoderadoId,
                                nombre,
                                apellido,
                                tipoDocumento,
                                documento,
                                telefono,
                                correo,
                                direccion);

                return ResponseEntity.ok(apoderado);
        }

        /*
         * =========================================================
         * ACTUALIZAR PARENTESCO
         * PUT /api/apoderados/estudiante/{estudianteId}/relacion/{apoderadoId}
         * =========================================================
         */

        @PutMapping("/estudiante/{estudianteId}/relacion/{apoderadoId}")
        public ResponseEntity<EstudianteApoderado> actualizarParentesco(
                        @PathVariable Long estudianteId,
                        @PathVariable Long apoderadoId,
                        @RequestParam String parentesco) {

                EstudianteApoderado relacion = apoderadoService.actualizarParentesco(
                                estudianteId,
                                apoderadoId,
                                parentesco);

                return ResponseEntity.ok(relacion);
        }
}
