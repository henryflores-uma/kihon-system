package com.kihon.kihon.service;

import com.kihon.kihon.model.Estudiante;
import com.kihon.kihon.model.Rol;
import com.kihon.kihon.model.Usuario;
import com.kihon.kihon.repository.EstudianteRepository;
import com.kihon.kihon.repository.RolRepository;
import com.kihon.kihon.repository.UsuarioRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final EstudianteRepository estudianteRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            RolRepository rolRepository,
            EstudianteRepository estudianteRepository,
            PasswordEncoder passwordEncoder) {

        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.estudianteRepository = estudianteRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    public Usuario crearUsuario(
            String username,
            String password,
            String nombre,
            String apellido,
            String correo,
            String nombreRol,
            Long estudianteId) {

        if (usuarioRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("El username ya existe");
        }

        if (usuarioRepository.findByCorreo(correo).isPresent()) {
            throw new RuntimeException("El correo ya existe");
        }

        Rol rol = rolRepository.findByNombre(nombreRol)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        Usuario usuario = new Usuario();

        usuario.setUsername(username);
        usuario.setPassword(passwordEncoder.encode(password));
        usuario.setNombre(nombre);
        usuario.setApellido(apellido);
        usuario.setCorreo(correo);
        usuario.setRol(rol);

        if (estudianteId != null) {

            Estudiante estudiante = estudianteRepository.findById(estudianteId)
                    .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));

            usuario.setEstudiante(estudiante);
        }

        return usuarioRepository.save(usuario);
    }
}