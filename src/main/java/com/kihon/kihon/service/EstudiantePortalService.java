package com.kihon.kihon.service;

import com.kihon.kihon.model.Asistencia;
import com.kihon.kihon.model.Estudiante;
import com.kihon.kihon.model.EstudianteGrupo;
import com.kihon.kihon.model.Usuario;
import com.kihon.kihon.repository.EstudianteGrupoRepository;
import com.kihon.kihon.repository.UsuarioRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EstudiantePortalService {

        private final UsuarioRepository usuarioRepository;
        private final AsistenciaService asistenciaService;
        private final EstudianteGrupoRepository estudianteGrupoRepository;
        private final PasswordEncoder passwordEncoder;

        public EstudiantePortalService(
                        UsuarioRepository usuarioRepository,
                        AsistenciaService asistenciaService,
                        EstudianteGrupoRepository estudianteGrupoRepository,
                        PasswordEncoder passwordEncoder) {

                this.usuarioRepository = usuarioRepository;
                this.asistenciaService = asistenciaService;
                this.estudianteGrupoRepository = estudianteGrupoRepository;
                this.passwordEncoder = passwordEncoder;
        }

        public Estudiante obtenerEstudianteAutenticado(
                        String username) {

                Usuario usuario = usuarioRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException(
                                                "Usuario no encontrado"));

                Estudiante estudiante = usuario.getEstudiante();

                if (estudiante == null) {
                        throw new RuntimeException(
                                        "El usuario no está vinculado a un estudiante");
                }

                return estudiante;
        }

        public List<Asistencia> listarMisAsistencias(
                        String username) {

                Estudiante estudiante = obtenerEstudianteAutenticado(username);

                return asistenciaService.listarPorEstudiante(
                                estudiante.getId());
        }

        public List<EstudianteGrupo> listarMisGrupos(
                        String username) {

                Estudiante estudiante = obtenerEstudianteAutenticado(username);

                return estudianteGrupoRepository
                                .findByEstudianteIdAndEstado(
                                                estudiante.getId(),
                                                "ACTIVO");
        }

        public Estudiante actualizarPerfil(
                        String username,
                        String nombre,
                        String apellido,
                        String telefono,
                        String correo,
                        String direccion,
                        String foto) {

                Estudiante estudiante = obtenerEstudianteAutenticado(username);

                if (nombre == null || nombre.isBlank()) {
                        throw new RuntimeException(
                                        "El nombre es obligatorio");
                }

                if (apellido == null || apellido.isBlank()) {
                        throw new RuntimeException(
                                        "El apellido es obligatorio");
                }

                if (telefono == null || telefono.isBlank()) {
                        throw new RuntimeException(
                                        "El teléfono es obligatorio");
                }

                if (correo == null || correo.isBlank()) {
                        throw new RuntimeException(
                                        "El correo es obligatorio");
                }

                if (direccion == null || direccion.isBlank()) {
                        throw new RuntimeException(
                                        "La dirección es obligatoria");
                }

                estudiante.setNombre(nombre);
                estudiante.setApellido(apellido);
                estudiante.setTelefono(telefono);
                estudiante.setCorreo(correo);
                estudiante.setDireccion(direccion);
                estudiante.setFoto(foto);

                return estudiante;
        }

        public void cambiarPassword(
                        String username,
                        String passwordActual,
                        String nuevaPassword) {

                Usuario usuario = usuarioRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException(
                                                "Usuario no encontrado"));

                if (passwordActual == null || passwordActual.isBlank()) {
                        throw new RuntimeException(
                                        "La contraseña actual es obligatoria");
                }

                if (nuevaPassword == null || nuevaPassword.isBlank()) {
                        throw new RuntimeException(
                                        "La nueva contraseña es obligatoria");
                }

                if (!passwordEncoder.matches(
                                passwordActual,
                                usuario.getPassword())) {

                        throw new RuntimeException(
                                        "La contraseña actual es incorrecta");
                }

                if (passwordActual.equals(nuevaPassword)) {
                        throw new RuntimeException(
                                        "La nueva contraseña debe ser diferente");
                }

                usuario.setPassword(
                                passwordEncoder.encode(nuevaPassword));

                usuarioRepository.save(usuario);
        }
}