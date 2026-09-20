package com.kihon.kihon.controller;

import com.kihon.kihon.dto.UsuarioActualizarRequest;
import com.kihon.kihon.dto.UsuarioEstudianteRequest;
import com.kihon.kihon.dto.UsuarioRequest;
import com.kihon.kihon.dto.UsuarioResponse;
import com.kihon.kihon.model.Usuario;
import com.kihon.kihon.service.UsuarioService;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

        private final UsuarioService usuarioService;

        public UsuarioController(UsuarioService usuarioService) {
                this.usuarioService = usuarioService;
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

        @PutMapping("/{id}")
        public ResponseEntity<UsuarioResponse> actualizarUsuario(
                        @PathVariable Long id,
                        @RequestBody UsuarioActualizarRequest request) {

                Usuario usuario = usuarioService.actualizarUsuario(
                                id,
                                request.getUsername(),
                                request.getNombre(),
                                request.getApellido(),
                                request.getTipoDocumento(),
                                request.getNumeroDocumento(),
                                request.getTelefono(),
                                request.getFechaNacimiento(),
                                request.getGenero(),
                                request.getCorreo(),
                                request.getFoto());

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

        @GetMapping("/senseis")
        public ResponseEntity<List<UsuarioResponse>> listarSenseisActivos() {

                List<Usuario> senseis = usuarioService.listarSenseisActivos();

                List<UsuarioResponse> response = senseis.stream()
                                .map(this::convertirResponse)
                                .toList();

                return ResponseEntity.ok(response);
        }

        private UsuarioResponse convertirResponse(Usuario usuario) {

                return new UsuarioResponse(
                                usuario.getId(),
                                usuario.getUsername(),
                                usuario.getNombre(),
                                usuario.getApellido(),
                                usuario.getCorreo(),
                                usuario.getRol().getNombre(),
                                usuario.getEstado());
        }
}