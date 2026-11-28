package com.kihon.kihon.service;

import com.kihon.kihon.dto.AsistenciaPageResponse;
import com.kihon.kihon.dto.EstudianteDashboardResponse;
import com.kihon.kihon.model.Asistencia;
import com.kihon.kihon.model.Estudiante;
import com.kihon.kihon.model.EstudianteGrupo;
import com.kihon.kihon.model.Persona;
import com.kihon.kihon.model.Usuario;
import com.kihon.kihon.repository.EstudianteGrupoRepository;
import com.kihon.kihon.repository.EstudianteRepository;
import com.kihon.kihon.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EstudiantePortalService {

    private final UsuarioRepository usuarioRepository;
    private final EstudianteRepository estudianteRepository;
    private final AsistenciaService asistenciaService;
    private final EstudianteGrupoRepository estudianteGrupoRepository;
    private final PasswordEncoder passwordEncoder;

    public EstudiantePortalService(
            UsuarioRepository usuarioRepository,
            EstudianteRepository estudianteRepository,
            AsistenciaService asistenciaService,
            EstudianteGrupoRepository estudianteGrupoRepository,
            PasswordEncoder passwordEncoder) {

        this.usuarioRepository = usuarioRepository;
        this.estudianteRepository = estudianteRepository;
        this.asistenciaService = asistenciaService;
        this.estudianteGrupoRepository = estudianteGrupoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /*
     * =========================================================
     * OBTENER ESTUDIANTE AUTENTICADO
     * =========================================================
     *
     * Usuario ya no depende de estudiante_id.
     * La relación canónica es:
     *
     * Usuario
     *   ↓
     * Persona
     *   ↓
     * Estudiante
     */

    @Transactional(readOnly = true)
    public Estudiante obtenerEstudianteAutenticado(String username) {

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException(
                        "Usuario no encontrado"));

        Persona persona = usuario.getPersona();

        if (persona == null) {
            throw new RuntimeException(
                    "El usuario no tiene una persona asociada");
        }

        Estudiante estudiante = estudianteRepository
                .findByPersona(persona)
                .orElseThrow(() -> new RuntimeException(
                        "El usuario no está vinculado a un estudiante"));

        return estudiante;
    }

    /*
     * =========================================================
     * ASISTENCIAS
     * =========================================================
     */

    @Transactional(readOnly = true)
    public List<Asistencia> listarMisAsistencias(String username) {

        Estudiante estudiante = obtenerEstudianteAutenticado(username);

        return asistenciaService.listarPorEstudiante(
                estudiante.getId());
    }

    @Transactional(readOnly = true)
    public Page<Asistencia> listarMisAsistenciasPaginadas(
            String username,
            String estado,
            Pageable pageable) {

        Estudiante estudiante = obtenerEstudianteAutenticado(username);

        return asistenciaService.listarPorEstudiantePaginado(
                estudiante.getId(),
                estado,
                pageable);
    }

    @Transactional(readOnly = true)
    public AsistenciaPageResponse.ResumenAsistencia obtenerResumenMisAsistencias(
            String username) {

        Estudiante estudiante = obtenerEstudianteAutenticado(username);

        return asistenciaService.obtenerResumenPorEstudiante(
                estudiante.getId());
    }

    @Transactional(readOnly = true)
    public List<Asistencia> listarMisAsistenciasRecientes(String username) {

        Estudiante estudiante = obtenerEstudianteAutenticado(username);

        return asistenciaService.listarUltimasPorEstudiante(
                estudiante.getId());
    }

    /*
     * =========================================================
     * GRUPOS
     * =========================================================
     */

    @Transactional(readOnly = true)
    public List<EstudianteGrupo> listarMisGrupos(String username) {

        Estudiante estudiante = obtenerEstudianteAutenticado(username);

        return estudianteGrupoRepository
                .findByEstudianteIdAndEstado(
                        estudiante.getId(),
                        "ACTIVO");
    }

    /*
     * =========================================================
     * ACTUALIZAR PERFIL
     * =========================================================
     *
     * Los datos personales pertenecen a Persona.
     * Estudiante solamente conserva información académica:
     * - cinturón
     * - estado
     * - fechas
     */

    @Transactional
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
            throw new RuntimeException("El nombre es obligatorio");
        }

        if (apellido == null || apellido.isBlank()) {
            throw new RuntimeException("El apellido es obligatorio");
        }

        if (telefono == null || telefono.isBlank()) {
            throw new RuntimeException("El teléfono es obligatorio");
        }

        if (correo == null || correo.isBlank()) {
            throw new RuntimeException("El correo es obligatorio");
        }

        if (direccion == null || direccion.isBlank()) {
            throw new RuntimeException("La dirección es obligatoria");
        }

        Persona persona = estudiante.getPersona();

        if (persona == null) {
            throw new RuntimeException("El estudiante no tiene una persona asociada");
        }

        persona.setNombre(nombre);
        persona.setApellido(apellido);
        persona.setTelefono(telefono);
        persona.setCorreo(correo);
        persona.setDireccion(direccion);
        persona.setFoto(foto);

        // La entidad Persona está administrada por JPA dentro
        // de la misma transacción del servicio.
        return estudiante;
    }

    /*
     * =========================================================
     * CAMBIAR CONTRASEÑA
     * =========================================================
     */

    @Transactional
    public void cambiarPassword(
            String username,
            String passwordActual,
            String nuevaPassword) {

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (passwordActual == null || passwordActual.isBlank()) {
            throw new RuntimeException("La contraseña actual es obligatoria");
        }

        if (nuevaPassword == null || nuevaPassword.isBlank()) {
            throw new RuntimeException("La nueva contraseña es obligatoria");
        }

        if (!passwordEncoder.matches(
                passwordActual,
                usuario.getPassword())) {

            throw new RuntimeException("La contraseña actual es incorrecta");
        }

        if (passwordActual.equals(nuevaPassword)) {
            throw new RuntimeException("La nueva contraseña debe ser diferente");
        }

        usuario.setPassword(passwordEncoder.encode(nuevaPassword));
        usuarioRepository.save(usuario);
    }

    /*
     * =========================================================
     * DASHBOARD
     * =========================================================
     */

    @Transactional(readOnly = true)
    public EstudianteDashboardResponse obtenerDatosDashboard(String username) {

        Estudiante estudiante = obtenerEstudianteAutenticado(username);

        Persona persona = estudiante.getPersona();

        return new EstudianteDashboardResponse(
                persona.getNombre(),
                persona.getApellido(),
                persona.getFoto(),
                estudiante.getCinturon().getNombre(),
                estudiante.getEstado());
    }
}