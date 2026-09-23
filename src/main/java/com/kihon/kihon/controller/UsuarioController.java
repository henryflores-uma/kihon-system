package com.kihon.kihon.controller;

import com.kihon.kihon.dto.UsuarioActualizarRequest;
import com.kihon.kihon.dto.UsuarioEstudianteRequest;
import com.kihon.kihon.dto.UsuarioRequest;
import com.kihon.kihon.dto.UsuarioResponse;
import com.kihon.kihon.model.Usuario;
import com.kihon.kihon.service.SupabaseStorageService;
import com.kihon.kihon.service.UsuarioService;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

        private final UsuarioService usuarioService;
        private final SupabaseStorageService storageService;

        public UsuarioController(
                        UsuarioService usuarioService,
                        SupabaseStorageService storageService) {

                this.usuarioService = usuarioService;
                this.storageService = storageService;
        }

        @PostMapping
        public ResponseEntity<UsuarioResponse> crearUsuario(
                        @RequestBody UsuarioRequest request) {

                Usuario usuario = usuarioService.crearUsuario(
                                request.getUsername(),
                                request.getPassword(),
                                request.getNombre(),
                                request.getApellido(),
                                request.getTipoDocumento(),
                                request.getNumeroDocumento(),
                                request.getTelefono(),
                                request.getFechaNacimiento(),
                                request.getGenero(),
                                request.getCorreo(),
                                request.getFoto(),
                                request.getEstudianteId());

                UsuarioResponse response = convertirResponse(usuario);

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(response);
        }

        @PostMapping("/estudiante")
        public ResponseEntity<UsuarioResponse> crearCuentaParaEstudiante(
                        @RequestBody UsuarioEstudianteRequest request) {

                Usuario usuario = usuarioService.crearCuentaParaEstudiante(
                                request.getEstudianteId(),
                                request.getUsername(),
                                request.getPassword(),
                                request.getGenero());

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(convertirResponse(usuario));
        }

        @GetMapping
        public ResponseEntity<List<UsuarioResponse>> listarUsuarios(
                        @RequestParam(required = false) String estado) {

                List<Usuario> usuarios = usuarioService.listarUsuarios();

                if (estado != null && !estado.isBlank()) {

                        String estadoBuscado = estado.toUpperCase();

                        usuarios = usuarios.stream()
                                        .filter(usuario -> usuario.getEstado()
                                                        .equalsIgnoreCase(estadoBuscado))
                                        .toList();
                }

                List<UsuarioResponse> response = usuarios.stream()
                                .map(this::convertirResponse)
                                .toList();

                return ResponseEntity.ok(response);
        }

        @PutMapping(value = "/{id}", consumes = "multipart/form-data")
        public ResponseEntity<UsuarioResponse> actualizarUsuario(
                        @PathVariable Long id,
                        @RequestParam String username,
                        @RequestParam String nombre,
                        @RequestParam String apellido,
                        @RequestParam String tipoDocumento,
                        @RequestParam String numeroDocumento,
                        @RequestParam String telefono,
                        @RequestParam String fechaNacimiento,
                        @RequestParam String genero,
                        @RequestParam String correo,
                        @RequestPart(required = false) MultipartFile foto) {

                Usuario usuario = usuarioService.actualizarUsuario(
                                id,
                                username,
                                nombre,
                                apellido,
                                tipoDocumento,
                                numeroDocumento,
                                telefono,
                                LocalDate.parse(fechaNacimiento),
                                genero,
                                correo,
                                foto);

                return ResponseEntity.ok(convertirResponse(usuario));
        }

        @PatchMapping("/{id}/estado")
        public ResponseEntity<UsuarioResponse> cambiarEstado(
                        @PathVariable Long id,
                        @RequestParam String estado) {

                Usuario usuario = usuarioService.cambiarEstado(id, estado);

                return ResponseEntity.ok(convertirResponse(usuario));
        }

        @PatchMapping("/{id}/rol")
        public ResponseEntity<UsuarioResponse> cambiarRol(
                        @PathVariable Long id,
                        @RequestParam String rol) {

                Usuario usuario = usuarioService.cambiarRol(id, rol);

                return ResponseEntity.ok(convertirResponse(usuario));
        }

        @PatchMapping("/{usuarioId}/estudiante/{estudianteId}")
        public ResponseEntity<UsuarioResponse> vincularEstudiante(
                        @PathVariable Long usuarioId,
                        @PathVariable Long estudianteId) {

                Usuario usuario = usuarioService.vincularEstudiante(
                                usuarioId,
                                estudianteId);

                return ResponseEntity.ok(convertirResponse(usuario));
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<Void> eliminarUsuario(
                        @PathVariable Long id) {

                usuarioService.eliminarUsuario(id);

                return ResponseEntity.noContent().build();
        }

        @GetMapping("/senseis")
        public ResponseEntity<List<UsuarioResponse>> listarSenseisActivos() {

                List<Usuario> senseis = usuarioService.listarSenseisActivos();

                List<UsuarioResponse> response = senseis.stream()
                                .map(this::convertirResponse)
                                .toList();

                return ResponseEntity.ok(response);
        }

        private UsuarioResponse convertirResponse(Usuario usuario) {

                String fotoUrl = null;

                Long estudianteId = null;

                /*
                 * =====================================================
                 * FOTO DEL USUARIO
                 * =====================================================
                 */

                if (usuario.getFoto() != null
                                && !usuario.getFoto().isBlank()) {

                        try {

                                fotoUrl = storageService.generarUrlFirmada(
                                                usuario.getFoto(),
                                                300);

                        } catch (Exception e) {

                                System.err.println(
                                                "No se pudo generar la URL "
                                                                + "firmada de la foto del usuario "
                                                                + usuario.getId()
                                                                + ": "
                                                                + e.getMessage());
                        }
                }

                /*
                 * =====================================================
                 * ESTUDIANTE VINCULADO
                 * =====================================================
                 */

                if (usuario.getEstudiante() != null) {

                        estudianteId = usuario.getEstudiante().getId();

                        /*
                         * Si el estudiante tiene una foto,
                         * esta tiene prioridad para mostrarla.
                         */

                        if (usuario.getEstudiante().getFoto() != null
                                        && !usuario.getEstudiante().getFoto().isBlank()) {

                                try {

                                        fotoUrl = storageService.generarUrlFirmada(
                                                        usuario.getEstudiante().getFoto(),
                                                        300);

                                } catch (Exception e) {

                                        System.err.println(
                                                        "No se pudo generar la URL "
                                                                        + "firmada de la foto del estudiante "
                                                                        + usuario.getEstudiante().getId()
                                                                        + ": "
                                                                        + e.getMessage());
                                }
                        }
                }

                /*
                 * =====================================================
                 * RESPUESTA
                 * =====================================================
                 */

                return new UsuarioResponse(
                                usuario.getId(),
                                usuario.getUsername(),
                                usuario.getNombre(),
                                usuario.getApellido(),
                                usuario.getTipoDocumento(),
                                usuario.getNumeroDocumento(),
                                usuario.getTelefono(),
                                usuario.getFechaNacimiento() != null
                                                ? usuario.getFechaNacimiento().toString()
                                                : null,
                                usuario.getGenero(),
                                usuario.getCorreo(),
                                usuario.getRol().getNombre(),
                                usuario.getEstado(),
                                fotoUrl,
                                estudianteId);
        }
}