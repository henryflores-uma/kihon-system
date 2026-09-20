package com.kihon.kihon.service;

import com.kihon.kihon.model.Estudiante;
import com.kihon.kihon.model.Rol;
import com.kihon.kihon.model.Usuario;
import com.kihon.kihon.repository.EstudianteRepository;
import com.kihon.kihon.repository.RolRepository;
import com.kihon.kihon.repository.UsuarioRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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
            String tipoDocumento,
            String numeroDocumento,
            String telefono,
            LocalDate fechaNacimiento,
            String genero,
            String correo,
            String foto,
            Long estudianteId) {

        if (username == null || username.isBlank()) {
            throw new RuntimeException("El username es obligatorio");
        }

        if (password == null || password.isBlank()) {
            throw new RuntimeException("La contraseña es obligatoria");
        }

        if (nombre == null || nombre.isBlank()) {
            throw new RuntimeException("El nombre es obligatorio");
        }

        if (apellido == null || apellido.isBlank()) {
            throw new RuntimeException("El apellido es obligatorio");
        }

        if (tipoDocumento == null || tipoDocumento.isBlank()) {
            throw new RuntimeException(
                    "El tipo de documento es obligatorio");
        }

        if (numeroDocumento == null || numeroDocumento.isBlank()) {
            throw new RuntimeException(
                    "El número de documento es obligatorio");
        }

        if (telefono == null || telefono.isBlank()) {
            throw new RuntimeException("El teléfono es obligatorio");
        }

        if (fechaNacimiento == null) {
            throw new RuntimeException(
                    "La fecha de nacimiento es obligatoria");
        }

        if (genero == null || genero.isBlank()) {
            throw new RuntimeException("El género es obligatorio");
        }

        if (correo == null || correo.isBlank()) {
            throw new RuntimeException("El correo es obligatorio");
        }

        if (usuarioRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("El username ya existe");
        }

        if (usuarioRepository.findByCorreo(correo).isPresent()) {
            throw new RuntimeException("El correo ya existe");
        }

        if (usuarioRepository
                .findByNumeroDocumento(numeroDocumento)
                .isPresent()) {

            throw new RuntimeException(
                    "El número de documento ya está registrado");
        }

        Rol rolEstudiante = rolRepository.findByNombre("ESTUDIANTE")
                .orElseThrow(() -> new RuntimeException(
                        "El rol ESTUDIANTE no existe"));

        Usuario usuario = new Usuario();

        usuario.setUsername(username);
        usuario.setPassword(
                passwordEncoder.encode(password));

        usuario.setNombre(nombre);
        usuario.setApellido(apellido);
        usuario.setTipoDocumento(tipoDocumento);
        usuario.setNumeroDocumento(numeroDocumento);
        usuario.setTelefono(telefono);
        usuario.setFechaNacimiento(fechaNacimiento);
        usuario.setGenero(genero);
        usuario.setCorreo(correo);
        usuario.setFoto(foto);

        /*
         * Toda cuenta creada desde el registro público
         * queda pendiente de activación.
         */
        usuario.setEstado("PENDIENTE");

        /*
         * El usuario no puede escoger el rol durante
         * el registro.
         *
         * El administrador podrá modificarlo posteriormente.
         */
        usuario.setRol(rolEstudiante);

        if (estudianteId != null) {

            Estudiante estudiante = estudianteRepository.findById(estudianteId)
                    .orElseThrow(() -> new RuntimeException(
                            "Estudiante no encontrado"));

            usuario.setEstudiante(estudiante);
        }

        return usuarioRepository.save(usuario);
    }

    public Usuario actualizarUsuario(
            Long id,
            String username,
            String nombre,
            String apellido,
            String tipoDocumento,
            String numeroDocumento,
            String telefono,
            LocalDate fechaNacimiento,
            String genero,
            String correo,
            String foto) {

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Usuario no encontrado"));

        if (username == null || username.isBlank()) {
            throw new RuntimeException(
                    "El username es obligatorio");
        }

        if (nombre == null || nombre.isBlank()) {
            throw new RuntimeException(
                    "El nombre es obligatorio");
        }

        if (apellido == null || apellido.isBlank()) {
            throw new RuntimeException(
                    "El apellido es obligatorio");
        }

        if (tipoDocumento == null || tipoDocumento.isBlank()) {
            throw new RuntimeException(
                    "El tipo de documento es obligatorio");
        }

        if (numeroDocumento == null || numeroDocumento.isBlank()) {
            throw new RuntimeException(
                    "El número de documento es obligatorio");
        }

        if (telefono == null || telefono.isBlank()) {
            throw new RuntimeException(
                    "El teléfono es obligatorio");
        }

        if (fechaNacimiento == null) {
            throw new RuntimeException(
                    "La fecha de nacimiento es obligatoria");
        }

        if (genero == null || genero.isBlank()) {
            throw new RuntimeException(
                    "El género es obligatorio");
        }

        if (correo == null || correo.isBlank()) {
            throw new RuntimeException(
                    "El correo es obligatorio");
        }

        usuarioRepository.findByUsername(username)
                .ifPresent(usuarioExistente -> {
                    if (!usuarioExistente.getId().equals(id)) {
                        throw new RuntimeException(
                                "El username ya existe");
                    }
                });

        usuarioRepository.findByCorreo(correo)
                .ifPresent(usuarioExistente -> {
                    if (!usuarioExistente.getId().equals(id)) {
                        throw new RuntimeException(
                                "El correo ya existe");
                    }
                });

        usuarioRepository.findByNumeroDocumento(numeroDocumento)
                .ifPresent(usuarioExistente -> {
                    if (!usuarioExistente.getId().equals(id)) {
                        throw new RuntimeException(
                                "El número de documento ya está registrado");
                    }
                });

        usuario.setUsername(username);
        usuario.setNombre(nombre);
        usuario.setApellido(apellido);
        usuario.setTipoDocumento(tipoDocumento);
        usuario.setNumeroDocumento(numeroDocumento);
        usuario.setTelefono(telefono);
        usuario.setFechaNacimiento(fechaNacimiento);
        usuario.setGenero(genero);
        usuario.setCorreo(correo);
        usuario.setFoto(foto);

        return usuarioRepository.save(usuario);
    }

    public Usuario cambiarEstado(Long id, String nuevoEstado) {

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (nuevoEstado == null || nuevoEstado.isBlank()) {
            throw new RuntimeException("El estado es obligatorio");
        }

        String estado = nuevoEstado.toUpperCase();

        if (!estado.equals("ACTIVO")
                && !estado.equals("INACTIVO")
                && !estado.equals("PENDIENTE")) {

            throw new RuntimeException(
                    "Estado no válido. Use ACTIVO, INACTIVO o PENDIENTE");
        }

        usuario.setEstado(estado);

        return usuarioRepository.save(usuario);
    }

    public Usuario vincularEstudiante(
            Long usuarioId,
            Long estudianteId) {

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException(
                        "Usuario no encontrado"));

        Estudiante estudiante = estudianteRepository.findById(estudianteId)
                .orElseThrow(() -> new RuntimeException(
                        "Estudiante no encontrado"));

        if (!"ESTUDIANTE".equalsIgnoreCase(
                usuario.getRol().getNombre())) {

            throw new RuntimeException(
                    "El usuario no tiene el rol ESTUDIANTE");
        }

        usuario.setEstudiante(estudiante);

        return usuarioRepository.save(usuario);
    }

    public Usuario cambiarRol(
            Long usuarioId,
            String nuevoRol) {

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException(
                        "Usuario no encontrado"));

        if (nuevoRol == null || nuevoRol.isBlank()) {
            throw new RuntimeException(
                    "El rol es obligatorio");
        }

        String nombreRol = nuevoRol.toUpperCase();

        if (!nombreRol.equals("ADMIN")
                && !nombreRol.equals("SECRETARIA")
                && !nombreRol.equals("SENSEI")
                && !nombreRol.equals("ESTUDIANTE")) {

            throw new RuntimeException(
                    "Rol no válido. Use ADMIN, SECRETARIA, SENSEI o ESTUDIANTE");
        }

        Rol rol = rolRepository.findByNombre(nombreRol)
                .orElseThrow(() -> new RuntimeException(
                        "El rol no existe"));

        usuario.setRol(rol);

        return usuarioRepository.save(usuario);
    }

    public Usuario crearCuentaParaEstudiante(
            Long estudianteId,
            String username,
            String password,
            String genero) {

        if (estudianteId == null) {
            throw new RuntimeException("El estudianteId es obligatorio");
        }

        if (username == null || username.isBlank()) {
            throw new RuntimeException("El username es obligatorio");
        }

        if (password == null || password.isBlank()) {
            throw new RuntimeException("La contraseña es obligatoria");
        }

        if (genero == null || genero.isBlank()) {
            throw new RuntimeException("El género es obligatorio");
        }

        if (usuarioRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("El username ya está registrado");
        }

        Estudiante estudiante = estudianteRepository.findById(estudianteId)
                .orElseThrow(() -> new RuntimeException(
                        "Estudiante no encontrado"));

        if (usuarioRepository.existsByEstudiante(estudiante)) {
            throw new RuntimeException(
                    "El estudiante ya tiene una cuenta de usuario");
        }

        Rol rolEstudiante = rolRepository.findByNombre("ESTUDIANTE")
                .orElseThrow(() -> new RuntimeException(
                        "Rol ESTUDIANTE no encontrado"));

        Usuario usuario = new Usuario();

        usuario.setUsername(username);
        usuario.setPassword(passwordEncoder.encode(password));

        usuario.setNombre(estudiante.getNombre());
        usuario.setApellido(estudiante.getApellido());
        usuario.setTipoDocumento(estudiante.getTipoDocumento());
        usuario.setNumeroDocumento(estudiante.getDocumento());
        usuario.setTelefono(estudiante.getTelefono());
        usuario.setFechaNacimiento(estudiante.getFechaNacimiento());
        usuario.setGenero(genero);
        usuario.setCorreo(estudiante.getCorreo());
        usuario.setFoto(estudiante.getFoto());

        usuario.setEstado("ACTIVO");
        usuario.setRol(rolEstudiante);
        usuario.setEstudiante(estudiante);

        return usuarioRepository.save(usuario);
    }

    public List<Usuario> listarSenseisActivos() {

        return usuarioRepository.findByRolNombreAndEstado(
                "SENSEI",
                "ACTIVO");
    }
}