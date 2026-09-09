package com.kihon.kihon.controller;

import com.kihon.kihon.dto.UsuarioRequest;
import com.kihon.kihon.dto.UsuarioResponse;
import com.kihon.kihon.model.Usuario;
import com.kihon.kihon.service.UsuarioService;
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
                                request.getCorreo(),
                                request.getRol(),
                                request.getEstudianteId());

                UsuarioResponse response = new UsuarioResponse(
                                usuario.getId(),
                                usuario.getUsername(),
                                usuario.getNombre(),
                                usuario.getApellido(),
                                usuario.getCorreo(),
                                usuario.getRol().getNombre());

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(response);
        }
}