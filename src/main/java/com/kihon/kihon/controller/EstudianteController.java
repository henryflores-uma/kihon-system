package com.kihon.kihon.controller;

import com.kihon.kihon.dto.EstudianteResponse;
import com.kihon.kihon.model.Estudiante;
import com.kihon.kihon.service.EstudianteService;
import com.kihon.kihon.service.SupabaseStorageService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/estudiantes")
public class EstudianteController {

        private final EstudianteService estudianteService;
        private final SupabaseStorageService storageService;

        public EstudianteController(
                        EstudianteService estudianteService,
                        SupabaseStorageService storageService) {

                this.estudianteService = estudianteService;
                this.storageService = storageService;
        }

        /*
         * ==========================================
         * CREAR ESTUDIANTE
         * ==========================================
         */

        @PostMapping(consumes = "multipart/form-data")
        public ResponseEntity<EstudianteResponse> crearEstudiante(

                        @RequestParam String nombre,

                        @RequestParam String apellido,

                        @RequestParam String tipoDocumento,

                        @RequestParam String documento,

                        @RequestParam String telefono,

                        @RequestParam String correo,

                        @RequestParam LocalDate fechaNacimiento,

                        @RequestParam String direccion,

                        @RequestParam String cinturon,

                        @RequestPart(required = false) MultipartFile foto) {

                Estudiante estudiante = estudianteService.crearEstudiante(
                                nombre,
                                apellido,
                                tipoDocumento,
                                documento,
                                telefono,
                                correo,
                                fechaNacimiento,
                                direccion,
                                cinturon,
                                foto);

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(convertirResponse(estudiante));
        }

        /*
         * ==========================================
         * LISTAR ESTUDIANTES
         * ==========================================
         */

        @GetMapping
        public ResponseEntity<List<EstudianteResponse>> listarEstudiantes(

                        @RequestParam(required = false) String estado) {

                List<Estudiante> estudiantes;

                if (estado == null || estado.isBlank()) {

                        estudiantes = estudianteService.listarEstudiantes();

                } else {

                        estudiantes = estudianteService.listarPorEstado(
                                        estado.toUpperCase());
                }

                List<EstudianteResponse> response = estudiantes.stream()
                                .map(this::convertirResponse)
                                .toList();

                return ResponseEntity.ok(response);
        }

        /*
         * ==========================================
         * BUSCAR ESTUDIANTE POR ID
         * ==========================================
         */

        @GetMapping("/{id}")
        public ResponseEntity<EstudianteResponse> buscarPorId(

                        @PathVariable Long id) {

                Estudiante estudiante = estudianteService.buscarPorId(id);

                return ResponseEntity.ok(
                                convertirResponse(estudiante));
        }

        /*
         * ==========================================
         * ACTUALIZAR ESTUDIANTE
         * ==========================================
         */

        @PutMapping(value = "/{id}", consumes = "multipart/form-data")
        public ResponseEntity<EstudianteResponse> actualizarEstudiante(

                        @PathVariable Long id,

                        @RequestParam String nombre,

                        @RequestParam String apellido,

                        @RequestParam String documento,

                        @RequestParam String telefono,

                        @RequestParam String correo,

                        @RequestParam String cinturon,

                        @RequestPart(required = false) MultipartFile foto,

                        @RequestParam(defaultValue = "false") boolean quitarFoto) {

                Estudiante estudiante = estudianteService.actualizarEstudiante(
                                id,
                                nombre,
                                apellido,
                                documento,
                                telefono,
                                correo,
                                cinturon,
                                foto,
                                quitarFoto);

                return ResponseEntity.ok(
                                convertirResponse(estudiante));
        }

        /*
         * ==========================================
         * CAMBIAR ESTADO
         * ==========================================
         */

        @PatchMapping("/{id}/estado")
        public ResponseEntity<EstudianteResponse> cambiarEstado(

                        @PathVariable Long id,

                        @RequestParam String estado) {

                Estudiante estudiante = estudianteService.cambiarEstado(
                                id,
                                estado.toUpperCase());

                return ResponseEntity.ok(
                                convertirResponse(estudiante));
        }

        /*
         * ==========================================
         * CONVERTIR A RESPONSE
         * ==========================================
         */

        private EstudianteResponse convertirResponse(
                        Estudiante estudiante) {

                String fotoUrl = null;

                if (estudiante.getFoto() != null
                                && !estudiante.getFoto().isBlank()) {

                        try {

                                fotoUrl = storageService.generarUrlFirmada(
                                                estudiante.getFoto(),
                                                300);

                        } catch (Exception e) {

                                System.err.println(
                                                "No se pudo generar la URL de la foto "
                                                                + "del estudiante "
                                                                + estudiante.getId()
                                                                + ": "
                                                                + e.getMessage());
                        }
                }

                return new EstudianteResponse(

                                estudiante.getId(),

                                estudiante.getNombre(),

                                estudiante.getApellido(),

                                estudiante.getTipoDocumento(),

                                estudiante.getDocumento(),

                                estudiante.getTelefono(),

                                estudiante.getCorreo(),

                                estudiante.getFechaNacimiento(),

                                estudiante.getDireccion(),

                                estudiante.getFoto(),

                                fotoUrl,

                                estudiante.getCinturon(),

                                estudiante.getEstado());
        }
}