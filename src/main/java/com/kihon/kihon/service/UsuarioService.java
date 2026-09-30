package com.kihon.kihon.service;

import com.kihon.kihon.model.Estudiante;
import com.kihon.kihon.model.Evento;
import com.kihon.kihon.model.Grupo;
import com.kihon.kihon.model.Persona;
import com.kihon.kihon.model.Rol;
import com.kihon.kihon.model.TipoDocumento;
import com.kihon.kihon.model.Usuario;

import com.kihon.kihon.repository.EstudianteRepository;
import com.kihon.kihon.repository.EventoRepository;
import com.kihon.kihon.repository.GrupoRepository;
import com.kihon.kihon.repository.PersonaRepository;
import com.kihon.kihon.repository.RolRepository;
import com.kihon.kihon.repository.TipoDocumentoRepository;
import com.kihon.kihon.repository.UsuarioRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class UsuarioService {

        private final UsuarioRepository usuarioRepository;
        private final RolRepository rolRepository;
        private final EstudianteRepository estudianteRepository;
        private final EventoRepository eventoRepository;
        private final GrupoRepository grupoRepository;
        private final TipoDocumentoRepository tipoDocumentoRepository;
        private final PersonaRepository personaRepository;
        private final PasswordEncoder passwordEncoder;
        private final SupabaseStorageService storageService;

        public UsuarioService(
                        UsuarioRepository usuarioRepository,
                        RolRepository rolRepository,
                        EstudianteRepository estudianteRepository,
                        EventoRepository eventoRepository,
                        GrupoRepository grupoRepository,
                        TipoDocumentoRepository tipoDocumentoRepository,
                        PersonaRepository personaRepository,
                        PasswordEncoder passwordEncoder,
                        SupabaseStorageService storageService) {

                this.usuarioRepository = usuarioRepository;
                this.rolRepository = rolRepository;
                this.estudianteRepository = estudianteRepository;
                this.eventoRepository = eventoRepository;
                this.grupoRepository = grupoRepository;
                this.tipoDocumentoRepository = tipoDocumentoRepository;
                this.personaRepository = personaRepository;
                this.passwordEncoder = passwordEncoder;
                this.storageService = storageService;
        }

        /*
         * =========================================================
         * LISTAR USUARIOS
         * =========================================================
         */
        public List<Usuario> listarUsuarios() {

                return usuarioRepository.findAll();
        }

        /*
         * =========================================================
         * BUSCAR USUARIO POR ID
         * =========================================================
         */
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

                /*
                 * El usuario puede estar siendo utilizado como
                 * responsable de eventos.
                 */
                List<Evento> eventos = eventoRepository.findByResponsableId(id);

                for (Evento evento : eventos) {
                        evento.setResponsable(null);
                }

                if (!eventos.isEmpty()) {
                        eventoRepository.saveAll(eventos);
                }

                /*
                 * El usuario puede estar siendo utilizado como
                 * sensei de grupos.
                 */
                List<Grupo> grupos = grupoRepository.findBySenseiId(id);

                for (Grupo grupo : grupos) {
                        grupo.setSensei(null);
                }

                if (!grupos.isEmpty()) {
                        grupoRepository.saveAll(grupos);
                }

                /*
                 * NO eliminamos la Persona.
                 *
                 * La Persona podría seguir existiendo como:
                 * - estudiante
                 * - apoderado
                 * - ambas
                 */
                usuarioRepository.delete(usuario);
        }

        /*
         * =========================================================
         * CREAR USUARIO
         * =========================================================
         *
         * Este método corresponde al registro público.
         *
         * Los datos personales pertenecen a Persona.
         * No se recibe estudianteId porque la relación
         * Usuario -> Estudiante se determina mediante Persona.
         *
         * Tampoco se recibe foto porque el registro público
         * actualmente no permite cargar fotografía.
         * =========================================================
         */
        @Transactional
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
                        String correo) {

                /*
                 * ==============================
                 * VALIDACIONES
                 * ==============================
                 */

                if (username == null || username.isBlank()) {
                        throw new RuntimeException(
                                        "El username es obligatorio");
                }

                if (password == null || password.isBlank()) {
                        throw new RuntimeException(
                                        "La contraseña es obligatoria");
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

                /*
                 * ==============================
                 * VALIDAR USERNAME
                 * ==============================
                 */

                if (usuarioRepository.findByUsername(
                                username.trim()).isPresent()) {

                        throw new RuntimeException(
                                        "El username ya existe");
                }

                /*
                 * ==============================
                 * OBTENER TIPO DE DOCUMENTO
                 * ==============================
                 */

                TipoDocumento tipoDocumentoEntidad = tipoDocumentoRepository
                                .findByNombre(
                                                tipoDocumento.trim().toUpperCase())
                                .orElseThrow(() -> new RuntimeException(
                                                "El tipo de documento no existe"));

                /*
                 * ==============================
                 * BUSCAR PERSONA
                 * ==============================
                 *
                 * Una Persona puede existir previamente
                 * como estudiante, apoderado u otro registro.
                 *
                 * Si existe, reutilizamos esa Persona.
                 */

                Persona persona = personaRepository
                                .findByTipoDocumentoIdAndNumeroDocumento(
                                                tipoDocumentoEntidad.getId(),
                                                numeroDocumento.trim())
                                .orElse(null);

                if (persona != null) {

                        /*
                         * La Persona ya existe.
                         */

                        if (usuarioRepository
                                        .findByPersona(persona)
                                        .isPresent()) {

                                throw new RuntimeException(
                                                "La persona ya tiene una cuenta de usuario");
                        }

                        /*
                         * El correo debe coincidir
                         * con la Persona existente.
                         */

                        if (persona.getCorreo() == null
                                        || !persona.getCorreo()
                                                        .equalsIgnoreCase(
                                                                        correo.trim())) {

                                throw new RuntimeException(
                                                "El correo no coincide con el de la persona registrada");
                        }

                } else {

                        /*
                         * ==============================
                         * VALIDAR CORREO GLOBAL
                         * ==============================
                         */

                        if (personaRepository
                                        .findByCorreo(correo.trim())
                                        .isPresent()) {

                                throw new RuntimeException(
                                                "El correo ya existe");
                        }

                        /*
                         * ==============================
                         * CREAR PERSONA
                         * ==============================
                         */

                        persona = new Persona();

                        persona.setNombre(nombre.trim());
                        persona.setApellido(apellido.trim());
                        persona.setTipoDocumento(
                                        tipoDocumentoEntidad);
                        persona.setNumeroDocumento(
                                        numeroDocumento.trim());
                        persona.setTelefono(telefono.trim());
                        persona.setCorreo(correo.trim());
                        persona.setFechaNacimiento(
                                        fechaNacimiento);
                        persona.setGenero(
                                        genero.trim());

                        persona = personaRepository.save(persona);
                }

                /*
                 * ==============================
                 * CREAR USUARIO
                 * ==============================
                 */

                Rol rolEstudiante = rolRepository.findByNombre("ESTUDIANTE")
                                .orElseThrow(() -> new RuntimeException(
                                                "El rol ESTUDIANTE no existe"));

                Usuario usuario = new Usuario();

                usuario.setUsername(username.trim());

                usuario.setPassword(
                                passwordEncoder.encode(password));

                /*
                 * Persona canónica.
                 */
                usuario.setPersona(persona);

                /*
                 * Los datos personales NO se duplican
                 * en Usuario.
                 */
                usuario.setEstado("PENDIENTE");
                usuario.setFechaRegistro(LocalDateTime.now());
                usuario.setRol(rolEstudiante);

                return usuarioRepository.save(usuario);
        }

        /*
         * =========================================================
         * ACTUALIZAR USUARIO
         * =========================================================
         */
        @Transactional
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

                Persona persona = usuario.getPersona();

                if (persona == null) {
                        throw new RuntimeException(
                                        "El usuario no tiene una persona asociada");
                }

                Long personaId = persona.getId();

                /*
                 * ==============================
                 * VALIDACIONES
                 * ==============================
                 */

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

                /*
                 * ==============================
                 * USERNAME
                 * ==============================
                 */

                usuarioRepository.findByUsername(username.trim())
                                .ifPresent(usuarioExistente -> {

                                        if (!usuarioExistente.getId()
                                                        .equals(id)) {

                                                throw new RuntimeException(
                                                                "El username ya existe");
                                        }
                                });

                /*
                 * ==============================
                 * TIPO DOCUMENTO
                 * ==============================
                 */

                TipoDocumento tipoDocumentoEntidad = tipoDocumentoRepository
                                .findByNombre(
                                                tipoDocumento.trim().toUpperCase())
                                .orElseThrow(() -> new RuntimeException(
                                                "El tipo de documento no existe"));

                /*
                 * ==============================
                 * VALIDAR DOCUMENTO GLOBAL
                 * ==============================
                 */

                if (!persona.getNumeroDocumento()
                                .equals(numeroDocumento.trim())
                                || !persona.getTipoDocumento().getId()
                                                .equals(tipoDocumentoEntidad.getId())) {

                        boolean documentoExiste = personaRepository
                                        .findByTipoDocumentoIdAndNumeroDocumento(
                                                        tipoDocumentoEntidad.getId(),
                                                        numeroDocumento.trim())
                                        .filter(personaEncontrada -> !personaEncontrada
                                                        .getId()
                                                        .equals(personaId))
                                        .isPresent();

                        if (documentoExiste) {

                                throw new RuntimeException(
                                                "El documento ya existe");
                        }
                }

                /*
                 * ==============================
                 * VALIDAR CORREO GLOBAL
                 * ==============================
                 */

                if (!persona.getCorreo()
                                .equalsIgnoreCase(correo.trim())) {

                        boolean correoExiste = personaRepository
                                        .findByCorreo(correo.trim())
                                        .filter(personaEncontrada -> !personaEncontrada
                                                        .getId()
                                                        .equals(personaId))
                                        .isPresent();

                        if (correoExiste) {

                                throw new RuntimeException(
                                                "El correo ya existe");
                        }
                }

                /*
                 * ==============================
                 * ACTUALIZAR PERSONA
                 * ==============================
                 */

                persona.setNombre(nombre.trim());
                persona.setApellido(apellido.trim());
                persona.setTipoDocumento(tipoDocumentoEntidad);
                persona.setNumeroDocumento(
                                numeroDocumento.trim());
                persona.setTelefono(telefono.trim());
                persona.setFechaNacimiento(fechaNacimiento);
                persona.setGenero(genero.trim());
                persona.setCorreo(correo.trim());

                /*
                 * ==============================
                 * FOTO
                 * ==============================
                 */

                if (foto != null && !foto.isEmpty()) {

                        validarFotoPerfil(foto);

                        String extension = obtenerExtensionFoto(
                                        foto.getOriginalFilename());

                        String rutaNueva = "usuarios/"
                                        + usuario.getId()
                                        + "/perfil"
                                        + extension;

                        String fotoAnterior = persona.getFoto();

                        try {

                                if (fotoAnterior != null
                                                && !fotoAnterior.isBlank()
                                                && !fotoAnterior.equals(rutaNueva)) {

                                        storageService.eliminarFoto(
                                                        fotoAnterior);
                                }

                                String rutaSubida = storageService.subirFoto(
                                                foto,
                                                rutaNueva);

                                persona.setFoto(rutaSubida);

                        } catch (Exception e) {

                                throw new RuntimeException(
                                                "No se pudo guardar la foto del usuario",
                                                e);
                        }
                }

                personaRepository.save(persona);

                /*
                 * ==============================
                 * ACTUALIZAR USUARIO
                 * ==============================
                 */

                usuario.setUsername(username.trim());

                return usuarioRepository.save(usuario);
        }

        /*
         * =========================================================
         * CAMBIAR ESTADO
         * =========================================================
         */
        public Usuario cambiarEstado(
                        Long id,
                        String nuevoEstado) {

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

        /*
         * =========================================================
         * CAMBIAR ROL
         * =========================================================
         */
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

        /*
         * =========================================================
         * CREAR CUENTA PARA ESTUDIANTE
         * =========================================================
         */
        @Transactional
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

                if (usuarioRepository.findByUsername(
                                username.trim()).isPresent()) {

                        throw new RuntimeException(
                                        "El username ya está registrado");
                }

                Estudiante estudiante = estudianteRepository.findById(
                                estudianteId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Estudiante no encontrado"));

                Persona persona = estudiante.getPersona();

                if (persona == null) {

                        throw new RuntimeException(
                                        "El estudiante no tiene una persona asociada");
                }

                /*
                 * Verificamos si la Persona ya tiene
                 * una cuenta de usuario.
                 */
                if (usuarioRepository.findByPersona(persona).isPresent()) {

                        throw new RuntimeException(
                                        "La persona ya tiene una cuenta de usuario");
                }

                /*
                 * ==============================
                 * ACTUALIZAR GÉNERO
                 * ==============================
                 */

                persona.setGenero(genero.trim());

                persona = personaRepository.save(persona);

                Rol rolEstudiante = rolRepository.findByNombre("ESTUDIANTE")
                                .orElseThrow(() -> new RuntimeException(
                                                "Rol ESTUDIANTE no encontrado"));

                Usuario usuario = new Usuario();

                usuario.setUsername(username.trim());

                usuario.setPassword(
                                passwordEncoder.encode(password));

                /*
                 * MISMA PERSONA
                 */
                usuario.setPersona(persona);

                /*
                 * Los datos personales permanecen
                 * exclusivamente en Persona.
                 */

                usuario.setEstado("ACTIVO");
                usuario.setFechaRegistro(LocalDateTime.now());
                usuario.setRol(rolEstudiante);

                return usuarioRepository.save(usuario);
        }

        /*
         * =========================================================
         * LISTAR SENSEIS ACTIVOS
         * =========================================================
         */
        public List<Usuario> listarSenseisActivos() {

                return usuarioRepository.findByRolNombreAndEstado(
                                "SENSEI",
                                "ACTIVO");
        }

        /*
         * =========================================================
         * BUSCAR POR USERNAME
         * =========================================================
         */
        public Usuario buscarPorUsername(String username) {

                return usuarioRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException(
                                                "Usuario no encontrado"));
        }

        /*
         * =========================================================
         * ACTUALIZAR PERFIL PROPIO
         * =========================================================
         */
        @Transactional
        public Usuario actualizarPerfil(
                        String usernameActual,
                        String nuevoUsername,
                        String nombre,
                        String apellido,
                        String correo,
                        MultipartFile foto) {

                Usuario usuario = usuarioRepository.findByUsername(
                                usernameActual)
                                .orElseThrow(() -> new RuntimeException(
                                                "Usuario no encontrado"));

                Persona persona = usuario.getPersona();

                if (persona == null) {

                        throw new RuntimeException(
                                        "El usuario no tiene una persona asociada");
                }

                Long personaId = persona.getId();

                if (nuevoUsername == null
                                || nuevoUsername.isBlank()) {

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
                 * ==============================
                 * USERNAME
                 * ==============================
                 */

                usuarioRepository.findByUsername(
                                nuevoUsername.trim())
                                .ifPresent(usuarioExistente -> {

                                        if (!usuarioExistente.getId()
                                                        .equals(usuario.getId())) {

                                                throw new RuntimeException(
                                                                "El username ya existe");
                                        }
                                });

                /*
                 * ==============================
                 * CORREO GLOBAL
                 * ==============================
                 */

                if (!persona.getCorreo()
                                .equalsIgnoreCase(correo.trim())) {

                        personaRepository.findByCorreo(
                                        correo.trim())
                                        .ifPresent(personaExistente -> {

                                                if (!personaExistente.getId()
                                                                .equals(personaId)) {

                                                        throw new RuntimeException(
                                                                        "El correo ya existe");
                                                }
                                        });
                }

                /*
                 * ==============================
                 * ACTUALIZAR PERSONA
                 * ==============================
                 */

                persona.setNombre(nombre.trim());
                persona.setApellido(apellido.trim());
                persona.setCorreo(correo.trim());

                /*
                 * ==============================
                 * FOTO
                 * ==============================
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

                                if (persona.getFoto() != null
                                                && !persona.getFoto().isBlank()
                                                && !persona.getFoto().equals(nuevaRuta)) {

                                        storageService.eliminarFoto(
                                                        persona.getFoto());
                                }

                                String rutaSubida = storageService.subirFoto(
                                                foto,
                                                nuevaRuta);

                                persona.setFoto(rutaSubida);

                        } catch (Exception e) {

                                throw new RuntimeException(
                                                "No se pudo actualizar la fotografía: "
                                                                + e.getMessage(),
                                                e);
                        }
                }

                personaRepository.save(persona);

                /*
                 * ==============================
                 * ACTUALIZAR USUARIO
                 * ==============================
                 */

                usuario.setUsername(nuevoUsername.trim());

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
         * OBTENER EXTENSIÓN DE FOTOGRAFÍA
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

                if (passwordActual == null
                                || passwordActual.isBlank()) {

                        throw new RuntimeException(
                                        "La contraseña actual es obligatoria");
                }

                if (passwordNueva == null
                                || passwordNueva.isBlank()) {

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