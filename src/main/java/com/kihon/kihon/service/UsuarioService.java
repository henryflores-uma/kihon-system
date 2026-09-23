package com.kihon.kihon.service;

import com.kihon.kihon.model.Estudiante;
import com.kihon.kihon.model.Evento;
import com.kihon.kihon.model.Grupo;
import com.kihon.kihon.model.Rol;
import com.kihon.kihon.model.Usuario;
import com.kihon.kihon.repository.EstudianteRepository;
import com.kihon.kihon.repository.EventoRepository;
import com.kihon.kihon.repository.GrupoRepository;
import com.kihon.kihon.repository.RolRepository;
import com.kihon.kihon.repository.UsuarioRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@Service
public class UsuarioService {

        private final UsuarioRepository usuarioRepository;
        private final RolRepository rolRepository;
        private final EstudianteRepository estudianteRepository;
        private final EventoRepository eventoRepository;
        private final GrupoRepository grupoRepository;
        private final PasswordEncoder passwordEncoder;
        private final SupabaseStorageService storageService;

        public UsuarioService(
                        UsuarioRepository usuarioRepository,
                        RolRepository rolRepository,
                        EstudianteRepository estudianteRepository,
                        EventoRepository eventoRepository,
                        GrupoRepository grupoRepository,
                        PasswordEncoder passwordEncoder,
                        SupabaseStorageService storageService) {

                this.usuarioRepository = usuarioRepository;
                this.rolRepository = rolRepository;
                this.estudianteRepository = estudianteRepository;
                this.eventoRepository = eventoRepository;
                this.grupoRepository = grupoRepository;
                this.passwordEncoder = passwordEncoder;
                this.storageService = storageService;
        }

        public List<Usuario> listarUsuarios() {
                return usuarioRepository.findAll();
        }

        public Usuario buscarPorId(Long id) {
                return usuarioRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException(
                                                "Usuario no encontrado"));
        }

        /*
         * =========================================================
         * ELIMINAR USUARIO
         * =========================================================
         */
        @Transactional
        public void eliminarUsuario(Long id) {

                Usuario usuario = usuarioRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException(
                                                "Usuario no encontrado"));

                List<Evento> eventos = eventoRepository.findByResponsableId(id);

                for (Evento evento : eventos) {
                        evento.setResponsable(null);
                }

                if (!eventos.isEmpty()) {
                        eventoRepository.saveAll(eventos);
                }

                List<Grupo> grupos = grupoRepository.findBySenseiId(id);

                for (Grupo grupo : grupos) {
                        grupo.setSensei(null);
                }

                if (!grupos.isEmpty()) {
                        grupoRepository.saveAll(grupos);
                }

                usuarioRepository.delete(usuario);
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

                usuario.setEstado("PENDIENTE");

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
                        MultipartFile foto) {

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
                if (foto != null && !foto.isEmpty()) {

                        validarFotoPerfil(foto);

                        String extension = obtenerExtensionFoto(
                                        foto.getOriginalFilename());

                        String rutaNueva = "usuarios/"
                                        + usuario.getId()
                                        + "/perfil"
                                        + extension;

                        String fotoAnterior = usuario.getFoto();

                        try {

                                if (fotoAnterior != null
                                                && !fotoAnterior.isBlank()
                                                && !fotoAnterior.equals(rutaNueva)) {

                                        storageService.eliminarFoto(fotoAnterior);
                                }

                                String rutaSubida = storageService.subirFoto(
                                                foto,
                                                rutaNueva);

                                usuario.setFoto(rutaSubida);

                        } catch (Exception e) {

                                throw new RuntimeException(
                                                "No se pudo guardar la foto del usuario",
                                                e);
                        }
                }

                return usuarioRepository.save(usuario);
        }

        public Usuario cambiarEstado(Long id, String nuevoEstado) {

                Usuario usuario = usuarioRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException(
                                                "Usuario no encontrado"));

                if (nuevoEstado == null || nuevoEstado.isBlank()) {
                        throw new RuntimeException(
                                        "El estado es obligatorio");
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
                        throw new RuntimeException(
                                        "El estudianteId es obligatorio");
                }

                if (username == null || username.isBlank()) {
                        throw new RuntimeException(
                                        "El username es obligatorio");
                }

                if (password == null || password.isBlank()) {
                        throw new RuntimeException(
                                        "La contraseña es obligatoria");
                }

                if (genero == null || genero.isBlank()) {
                        throw new RuntimeException(
                                        "El género es obligatorio");
                }

                if (usuarioRepository.findByUsername(username).isPresent()) {
                        throw new RuntimeException(
                                        "El username ya está registrado");
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

                usuario.setPassword(
                                passwordEncoder.encode(password));

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

        public Usuario buscarPorUsername(String username) {

                return usuarioRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException(
                                                "Usuario no encontrado"));
        }

        /*
         * =========================================================
         * ACTUALIZAR PERFIL PROPIO
         * =========================================================
         *
         * Solo permite modificar:
         *
         * - username
         * - nombre
         * - apellido
         * - correo
         * - fotografía
         *
         * Los demás datos permanecen bajo control administrativo.
         */
        public Usuario actualizarPerfil(
                        String usernameActual,
                        String nuevoUsername,
                        String nombre,
                        String apellido,
                        String correo,
                        MultipartFile foto) {

                Usuario usuario = usuarioRepository.findByUsername(usernameActual)
                                .orElseThrow(() -> new RuntimeException(
                                                "Usuario no encontrado"));

                if (nuevoUsername == null || nuevoUsername.isBlank()) {
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

                if (correo == null || correo.isBlank()) {
                        throw new RuntimeException(
                                        "El correo es obligatorio");
                }

                /*
                 * =====================================================
                 * VALIDAR USERNAME ÚNICO
                 * =====================================================
                 */

                usuarioRepository.findByUsername(nuevoUsername)
                                .ifPresent(usuarioExistente -> {

                                        if (!usuarioExistente.getId()
                                                        .equals(usuario.getId())) {

                                                throw new RuntimeException(
                                                                "El username ya existe");
                                        }
                                });

                /*
                 * =====================================================
                 * VALIDAR CORREO ÚNICO
                 * =====================================================
                 */

                usuarioRepository.findByCorreo(correo)
                                .ifPresent(usuarioExistente -> {

                                        if (!usuarioExistente.getId()
                                                        .equals(usuario.getId())) {

                                                throw new RuntimeException(
                                                                "El correo ya existe");
                                        }
                                });

                /*
                 * =====================================================
                 * ACTUALIZAR DATOS
                 * =====================================================
                 */

                usuario.setUsername(nuevoUsername);

                usuario.setNombre(nombre);

                usuario.setApellido(apellido);

                usuario.setCorreo(correo);

                /*
                 * =====================================================
                 * ACTUALIZAR FOTOGRAFÍA
                 * =====================================================
                 */

                if (foto != null && !foto.isEmpty()) {

                        try {

                                validarFotoPerfil(foto);

                                String extension = obtenerExtensionFoto(
                                                foto.getOriginalFilename());

                                String nuevaRuta = "usuarios/"
                                                + usuario.getId()
                                                + "/perfil"
                                                + extension;

                                /*
                                 * Si existe una fotografía anterior
                                 * y la extensión cambió, eliminamos
                                 * la fotografía anterior.
                                 */
                                if (usuario.getFoto() != null
                                                && !usuario.getFoto().isBlank()
                                                && !usuario.getFoto().equals(nuevaRuta)) {

                                        storageService.eliminarFoto(
                                                        usuario.getFoto());
                                }

                                /*
                                 * Subir la nueva fotografía.
                                 */
                                storageService.subirFoto(
                                                foto,
                                                nuevaRuta);

                                /*
                                 * Guardar solamente la ruta
                                 * en la base de datos.
                                 */
                                usuario.setFoto(nuevaRuta);

                        } catch (Exception e) {

                                throw new RuntimeException(
                                                "No se pudo actualizar la fotografía: "
                                                                + e.getMessage());
                        }
                }

                return usuarioRepository.save(usuario);
        }

        /*
         * =========================================================
         * VALIDAR FOTOGRAFÍA DEL PERFIL
         * =========================================================
         */

        private void validarFotoPerfil(
                        MultipartFile foto) {

                String tipoContenido = foto.getContentType();

                if (tipoContenido == null
                                || (!tipoContenido.equals("image/jpeg")
                                                && !tipoContenido.equals("image/png")
                                                && !tipoContenido.equals("image/webp"))) {

                        throw new RuntimeException(
                                        "La fotografía debe ser JPG, PNG o WEBP");
                }

                long tamanioMaximo = 5 * 1024 * 1024;

                if (foto.getSize() > tamanioMaximo) {

                        throw new RuntimeException(
                                        "La fotografía no puede superar los 5 MB");
                }
        }

        /*
         * =========================================================
         * OBTENER EXTENSIÓN DE LA FOTOGRAFÍA
         * =========================================================
         */

        private String obtenerExtensionFoto(
                        String nombreArchivo) {

                if (nombreArchivo == null
                                || !nombreArchivo.contains(".")) {

                        return ".jpg";
                }

                String extension = nombreArchivo.substring(
                                nombreArchivo.lastIndexOf("."))
                                .toLowerCase();

                if (!extension.equals(".jpg")
                                && !extension.equals(".jpeg")
                                && !extension.equals(".png")
                                && !extension.equals(".webp")) {

                        return ".jpg";
                }

                return extension;
        }

        /*
         * =========================================================
         * CAMBIAR CONTRASEÑA
         * =========================================================
         */

        public Usuario cambiarPassword(
                        String username,
                        String passwordActual,
                        String passwordNueva) {

                Usuario usuario = usuarioRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException(
                                                "Usuario no encontrado"));

                if (passwordActual == null || passwordActual.isBlank()) {
                        throw new RuntimeException(
                                        "La contraseña actual es obligatoria");
                }

                if (passwordNueva == null || passwordNueva.isBlank()) {
                        throw new RuntimeException(
                                        "La nueva contraseña es obligatoria");
                }

                if (passwordNueva.length() < 6) {
                        throw new RuntimeException(
                                        "La nueva contraseña debe tener al menos 6 caracteres");
                }

                if (!passwordEncoder.matches(
                                passwordActual,
                                usuario.getPassword())) {

                        throw new RuntimeException(
                                        "La contraseña actual es incorrecta");
                }

                usuario.setPassword(
                                passwordEncoder.encode(passwordNueva));

                return usuarioRepository.save(usuario);
        }
}