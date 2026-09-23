package com.kihon.kihon.controller;

import com.kihon.kihon.dto.CambiarPasswordRequest;
import com.kihon.kihon.dto.PerfilResponse;
import com.kihon.kihon.model.Usuario;
import com.kihon.kihon.service.SupabaseStorageService;
import com.kihon.kihon.service.UsuarioService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

        private final UsuarioService usuarioService;
        private final SupabaseStorageService storageService;

        public AuthController(
                        UsuarioService usuarioService,
                        SupabaseStorageService storageService) {

                this.usuarioService = usuarioService;
                this.storageService = storageService;
        }

        @GetMapping("/me")
        public Map<String, String> usuarioAutenticado(
                        Authentication authentication) {

                String username = authentication.getName();

                String rol = authentication.getAuthorities()
                                .stream()
                                .map(authority -> authority.getAuthority())
                                .findFirst()
                                .orElse("")
                                .replace("ROLE_", "");

                return Map.of(
                                "username", username,
                                "rol", rol);
        }

        @GetMapping("/perfil")
        public ResponseEntity<PerfilResponse> obtenerPerfil(
                        Authentication authentication) {

                Usuario usuario = usuarioService.buscarPorUsername(
                                authentication.getName());

                return ResponseEntity.ok(
                                convertirPerfilResponse(usuario));
        }

        @PutMapping(value = "/perfil", consumes = "multipart/form-data")
        public ResponseEntity<PerfilResponse> actualizarPerfil(
                        Authentication authentication,
                        @RequestParam String username,
                        @RequestParam String nombre,
                        @RequestParam String apellido,
                        @RequestParam String correo,
                        @RequestPart(required = false) MultipartFile foto) {

                Usuario usuario = usuarioService.actualizarPerfil(
                                authentication.getName(),
                                username,
                                nombre,
                                apellido,
                                correo,
                                foto);

                return ResponseEntity.ok(
                                convertirPerfilResponse(usuario));
        }

        @PatchMapping("/perfil/password")
        public ResponseEntity<Void> cambiarPassword(
                        Authentication authentication,
                        @RequestBody CambiarPasswordRequest request) {

                usuarioService.cambiarPassword(
                                authentication.getName(),
                                request.getPasswordActual(),
                                request.getPasswordNueva());

                return ResponseEntity.noContent().build();
        }

        private PerfilResponse convertirPerfilResponse(
                        Usuario usuario) {

                String fotoUrl = null;

                if (usuario.getFoto() != null
                                && !usuario.getFoto().isBlank()) {

                        try {
                                fotoUrl = storageService.generarUrlFirmada(
                                                usuario.getFoto(),
                                                300);

                        } catch (Exception e) {

                                System.err.println(
                                                "No se pudo generar la URL "
                                                                + "firmada de la foto "
                                                                + "del usuario "
                                                                + usuario.getId()
                                                                + ": "
                                                                + e.getMessage());
                        }
                }

                return new PerfilResponse(
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
                                usuario.getFechaRegistro() != null
                                                ? usuario.getFechaRegistro().toString()
                                                : null);
        }
}