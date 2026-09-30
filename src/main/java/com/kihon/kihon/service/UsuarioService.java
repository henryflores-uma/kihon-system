package com.kihon.kihon.service;

import com.kihon.kihon.exception.DatoDuplicadoException;
import com.kihon.kihon.exception.RecursoNoEncontradoException;
import com.kihon.kihon.exception.ValidacionException;

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
                                .orElseThrow(() -> new RecursoNoEncontradoException(
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
                                .orElseThrow(() -> new RecursoNoEncontradoException(
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
         * Registro público.
         *
         * Los datos personales pertenecen a Persona.
         * Usuario solamente mantiene los datos propios
         * de la cuenta.
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
                 * VALIDACIONES BÁSICAS
                 * ==============================
                 */

                if (username == null || username.isBlank()) {
                        throw new ValidacionException(
                                        "El username es obligatorio");
                }

                username = username.trim();

                if (username.length() < 4 || username.length() > 30) {
                        throw new ValidacionException(
                                        "El username debe tener entre 4 y 30 caracteres");
                }

                if (!username.matches("[a-zA-Z0-9._-]+")) {
                        throw new ValidacionException(
                                        "El username solo puede contener letras, números, punto, guion y guion bajo");
                }

                if (password == null || password.isBlank()) {
                        throw new ValidacionException(
                                        "La contraseña es obligatoria");
                }

                if (password.length() < 8 || password.length() > 72) {
                        throw new ValidacionException(
                                        "La contraseña debe tener entre 8 y 72 caracteres");
                }

                if (nombre == null || nombre.isBlank()) {
                        throw new ValidacionException(
                                        "El nombre es obligatorio");
                }

                nombre = nombre.trim();

                if (nombre.length() > 50) {
                        throw new ValidacionException(
                                        "El nombre no puede superar los 50 caracteres");
                }

                if (!nombre.matches("[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+")) {
                        throw new ValidacionException(
                                        "El nombre solo puede contener letras y espacios");
                }

                if (apellido == null || apellido.isBlank()) {
                        throw new ValidacionException(
                                        "El apellido es obligatorio");
                }

                apellido = apellido.trim();

                if (apellido.length() > 50) {
                        throw new ValidacionException(
                                        "El apellido no puede superar los 50 caracteres");
                }

                if (!apellido.matches("[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+")) {
                        throw new ValidacionException(
                                        "El apellido solo puede contener letras y espacios");
                }

                if (tipoDocumento == null || tipoDocumento.isBlank()) {
                        throw new ValidacionException(
                                        "El tipo de documento es obligatorio");
                }

                if (numeroDocumento == null || numeroDocumento.isBlank()) {
                        throw new ValidacionException(
                                        "El número de documento es obligatorio");
                }

                numeroDocumento = numeroDocumento.trim();

                if (telefono == null || telefono.isBlank()) {
                        throw new ValidacionException(
                                        "El teléfono es obligatorio");
                }

                telefono = telefono.trim();

                if (fechaNacimiento == null) {
                        throw new ValidacionException(
                                        "La fecha de nacimiento es obligatoria");
                }

                if (fechaNacimiento.isAfter(LocalDate.now())) {
                        throw new ValidacionException(
                                        "La fecha de nacimiento no puede ser futura");
                }

                if (genero == null || genero.isBlank()) {
                        throw new ValidacionException(
                                        "El género es obligatorio");
                }

                genero = genero.trim();

                if (correo == null || correo.isBlank()) {
                        throw new ValidacionException(
                                        "El correo es obligatorio");
                }

                correo = correo.trim();

                /*
                 * ==============================
                 * VALIDAR USERNAME
                 * ==============================
                 */

                if (usuarioRepository.findByUsername(username).isPresent()) {

                        throw new DatoDuplicadoException(
                                        "El username ya existe");
                }

                /*
                 * ==============================
                 * OBTENER TIPO DE DOCUMENTO
                 * ==============================
                 */

                TipoDocumento tipoDocumentoEntidad = tipoDocumentoRepository
                                .findByNombre(
                                                tipoDocumento.toUpperCase())
                                .orElseThrow(() -> new RecursoNoEncontradoException(
                                                "El tipo de documento no existe"));

                /*
                 * ==============================
                 * VALIDAR DOCUMENTO DUPLICADO
                 * ==============================
                 *
                 * En el registro público no se permite
                 * utilizar una Persona que ya existe.
                 *
                 * Si el tipo y número de documento ya
                 * están registrados, se informa directamente
                 * que el documento está duplicado.
                 *
                 * No se compara el correo porque el problema
                 * real es el documento duplicado.
                 */

                if (personaRepository
                                .findByTipoDocumentoIdAndNumeroDocumento(
                                                tipoDocumentoEntidad.getId(),
                                                numeroDocumento)
                                .isPresent()) {

                        throw new DatoDuplicadoException(
                                        "El número de documento ya está registrado");
                }

                /*
                 * ==============================
                 * VALIDAR CORREO GLOBAL
                 * ==============================
                 */

                if (personaRepository
                                .findByCorreo(correo)
                                .isPresent()) {

                        throw new DatoDuplicadoException(
                                        "El correo ya existe");
                }

                /*
                 * ==============================
                 * VALIDAR TELÉFONO GLOBAL
                 * ==============================
                 */

                if (personaRepository
                                .findByTelefono(telefono)
                                .isPresent()) {

                        throw new DatoDuplicadoException(
                                        "El número de teléfono ya está registrado por otro usuario");
                }

                /*
                 * ==============================
                 * CREAR PERSONA
                 * ==============================
                 */

                Persona persona = new Persona();

                persona.setNombre(nombre);
                persona.setApellido(apellido);
                persona.setTipoDocumento(tipoDocumentoEntidad);
                persona.setNumeroDocumento(numeroDocumento);
                persona.setTelefono(telefono);
                persona.setCorreo(correo);
                persona.setFechaNacimiento(fechaNacimiento);
                persona.setGenero(genero);

                persona = personaRepository.save(persona);

                /*
                 * ==============================
                 * CREAR USUARIO
                 * ==============================
                 */

                Rol rolEstudiante = rolRepository.findByNombre("ESTUDIANTE")
                                .orElseThrow(() -> new RecursoNoEncontradoException(
                                                "El rol ESTUDIANTE no existe"));

                Usuario usuario = new Usuario();

                usuario.setUsername(username);

                usuario.setPassword(
                                passwordEncoder.encode(password));

                /*
                 * Persona canónica.
                 */
                usuario.setPersona(persona);

                /*
                 * Datos personales permanecen exclusivamente
                 * en Persona.
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
         *
         * Permite modificar:
         * - username
         * - rol
         * - contraseña
         * - nombre
         * - apellido
         * - documento
         * - teléfono
         * - fecha de nacimiento
         * - género
         * - correo
         * - fotografía
         *
         * La contraseña es opcional.
         * Si llega vacía, se mantiene la actual.
         * =========================================================
         */
        @Transactional
        public Usuario actualizarUsuario(
                        Long id,
                        String username,
                        String rol,
                        String password,
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
                                .orElseThrow(() -> new RecursoNoEncontradoException(
                                                "Usuario no encontrado"));

                Persona persona = usuario.getPersona();

                if (persona == null) {
                        throw new ValidacionException(
                                        "El usuario no tiene una persona asociada");
                }

                Long personaId = persona.getId();

                /*
                 * ==============================
                 * USERNAME
                 * ==============================
                 */

                if (username == null || username.isBlank()) {
                        throw new ValidacionException(
                                        "El username es obligatorio");
                }

                username = username.trim();

                if (username.length() < 4 || username.length() > 30) {
                        throw new ValidacionException(
                                        "El username debe tener entre 4 y 30 caracteres");
                }

                if (!username.matches("[a-zA-Z0-9._-]+")) {
                        throw new ValidacionException(
                                        "El username solo puede contener letras, números, punto, guion y guion bajo");
                }

                /*
                 * ==============================
                 * NOMBRE
                 * ==============================
                 */

                if (nombre == null || nombre.isBlank()) {
                        throw new ValidacionException(
                                        "El nombre es obligatorio");
                }

                nombre = nombre.trim();

                if (nombre.length() > 50) {
                        throw new ValidacionException(
                                        "El nombre no puede superar los 50 caracteres");
                }

                if (!nombre.matches("[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+")) {
                        throw new ValidacionException(
                                        "El nombre solo puede contener letras y espacios");
                }

                /*
                 * ==============================
                 * APELLIDO
                 * ==============================
                 */

                if (apellido == null || apellido.isBlank()) {
                        throw new ValidacionException(
                                        "El apellido es obligatorio");
                }

                apellido = apellido.trim();

                if (apellido.length() > 50) {
                        throw new ValidacionException(
                                        "El apellido no puede superar los 50 caracteres");
                }

                if (!apellido.matches("[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+")) {
                        throw new ValidacionException(
                                        "El apellido solo puede contener letras y espacios");
                }

                /*
                 * ==============================
                 * DOCUMENTO
                 * ==============================
                 */

                if (tipoDocumento == null || tipoDocumento.isBlank()) {
                        throw new ValidacionException(
                                        "El tipo de documento es obligatorio");
                }

                if (numeroDocumento == null || numeroDocumento.isBlank()) {
                        throw new ValidacionException(
                                        "El número de documento es obligatorio");
                }

                numeroDocumento = numeroDocumento.trim();

                /*
                 * ==============================
                 * TELÉFONO
                 * ==============================
                 */

                if (telefono == null || telefono.isBlank()) {
                        throw new ValidacionException(
                                        "El teléfono es obligatorio");
                }

                telefono = telefono.trim();

                /*
                 * ==============================
                 * FECHA DE NACIMIENTO
                 * ==============================
                 */

                if (fechaNacimiento == null) {
                        throw new ValidacionException(
                                        "La fecha de nacimiento es obligatoria");
                }

                if (fechaNacimiento.isAfter(LocalDate.now())) {
                        throw new ValidacionException(
                                        "La fecha de nacimiento no puede ser futura");
                }

                /*
                 * ==============================
                 * GÉNERO
                 * ==============================
                 */

                if (genero == null || genero.isBlank()) {
                        throw new ValidacionException(
                                        "El género es obligatorio");
                }

                genero = genero.trim();

                /*
                 * ==============================
                 * CORREO
                 * ==============================
                 */

                if (correo == null || correo.isBlank()) {
                        throw new ValidacionException(
                                        "El correo es obligatorio");
                }

                correo = correo.trim();

                /*
                 * ==============================
                 * USERNAME DUPLICADO
                 * ==============================
                 */

                usuarioRepository.findByUsername(username)
                                .ifPresent(usuarioExistente -> {

                                        if (!usuarioExistente.getId().equals(id)) {

                                                throw new DatoDuplicadoException(
                                                                "El username ya existe");
                                        }
                                });

                /*
                 * ==============================
                 * ROL
                 * ==============================
                 */

                if (rol == null || rol.isBlank()) {
                        throw new ValidacionException(
                                        "El rol es obligatorio");
                }

                String nombreRol = rol.trim().toUpperCase();

                if (!nombreRol.equals("ADMIN")
                                && !nombreRol.equals("SECRETARIA")
                                && !nombreRol.equals("SENSEI")
                                && !nombreRol.equals("ESTUDIANTE")) {

                        throw new ValidacionException(
                                        "Rol no válido. Use ADMIN, SECRETARIA, SENSEI o ESTUDIANTE");
                }

                Rol rolEntidad = rolRepository.findByNombre(nombreRol)
                                .orElseThrow(() -> new RecursoNoEncontradoException(
                                                "El rol no existe"));

                /*
                 * ==============================
                 * CONTRASEÑA
                 * ==============================
                 */

                boolean cambiarPassword = false;

                if (password != null && !password.isBlank()) {

                        if (password.length() < 8
                                        || password.length() > 72) {

                                throw new ValidacionException(
                                                "La contraseña debe tener entre 8 y 72 caracteres");
                        }

                        cambiarPassword = true;
                }

                /*
                 * ==============================
                 * TIPO DE DOCUMENTO
                 * ==============================
                 */

                TipoDocumento tipoDocumentoEntidad = tipoDocumentoRepository
                                .findByNombre(
                                                tipoDocumento.toUpperCase())
                                .orElseThrow(() -> new RecursoNoEncontradoException(
                                                "El tipo de documento no existe"));

                /*
                 * ==============================
                 * DOCUMENTO DUPLICADO
                 * ==============================
                 */

                if (!persona.getNumeroDocumento()
                                .equals(numeroDocumento)
                                || !persona.getTipoDocumento().getId()
                                                .equals(tipoDocumentoEntidad.getId())) {

                        boolean documentoExiste = personaRepository
                                        .findByTipoDocumentoIdAndNumeroDocumento(
                                                        tipoDocumentoEntidad.getId(),
                                                        numeroDocumento)
                                        .filter(personaEncontrada -> !personaEncontrada.getId()
                                                        .equals(personaId))
                                        .isPresent();

                        if (documentoExiste) {

                                throw new DatoDuplicadoException(
                                                "El documento ya existe");
                        }
                }

                /*
                 * ==============================
                 * CORREO DUPLICADO
                 * ==============================
                 */

                if (!persona.getCorreo().equalsIgnoreCase(correo)) {

                        boolean correoExiste = personaRepository
                                        .findByCorreo(correo)
                                        .filter(personaEncontrada -> !personaEncontrada.getId()
                                                        .equals(personaId))
                                        .isPresent();

                        if (correoExiste) {

                                throw new DatoDuplicadoException(
                                                "El correo ya existe");
                        }
                }

                /*
                 * ==============================
                 * TELÉFONO DUPLICADO
                 * ==============================
                 */

                if (!persona.getTelefono().equals(telefono)) {

                        boolean telefonoExiste = personaRepository
                                        .findByTelefono(telefono)
                                        .filter(personaEncontrada -> !personaEncontrada.getId()
                                                        .equals(personaId))
                                        .isPresent();

                        if (telefonoExiste) {

                                throw new DatoDuplicadoException(
                                                "El número de teléfono ya está registrado por otro usuario");
                        }
                }

                /*
                 * ==============================
                 * ACTUALIZAR PERSONA
                 * ==============================
                 */

                persona.setNombre(nombre);
                persona.setApellido(apellido);
                persona.setTipoDocumento(tipoDocumentoEntidad);
                persona.setNumeroDocumento(numeroDocumento);
                persona.setTelefono(telefono);
                persona.setFechaNacimiento(fechaNacimiento);
                persona.setGenero(genero);
                persona.setCorreo(correo);

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

                                /*
                                 * Primero se sube la nueva fotografía.
                                 * Si falla, conservamos la anterior.
                                 */
                                String rutaSubida = storageService.subirFoto(
                                                foto,
                                                rutaNueva);

                                persona.setFoto(rutaSubida);

                                /*
                                 * Eliminamos la fotografía anterior
                                 * después de subir correctamente la nueva.
                                 */
                                if (fotoAnterior != null
                                                && !fotoAnterior.isBlank()
                                                && !fotoAnterior.equals(rutaSubida)) {

                                        try {

                                                storageService.eliminarFoto(
                                                                fotoAnterior);

                                        } catch (Exception e) {

                                                System.err.println(
                                                                "No se pudo eliminar la fotografía anterior: "
                                                                                + e.getMessage());
                                        }
                                }

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

                usuario.setUsername(username);
                usuario.setRol(rolEntidad);

                /*
                 * Solo modificamos la contraseña
                 * cuando se proporcionó una nueva.
                 *
                 * Se vuelve a comprobar que password
                 * no sea null para evitar cualquier
                 * posible warning del analizador.
                 */
                if (cambiarPassword && password != null) {

                        usuario.setPassword(
                                        passwordEncoder.encode(password));
                }

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
                                .orElseThrow(() -> new RecursoNoEncontradoException(
                                                "Usuario no encontrado"));

                if (nuevoEstado == null || nuevoEstado.isBlank()) {
                        throw new ValidacionException(
                                        "El estado es obligatorio");
                }

                String estado = nuevoEstado.trim().toUpperCase();

                if (!estado.equals("ACTIVO")
                                && !estado.equals("INACTIVO")
                                && !estado.equals("PENDIENTE")) {

                        throw new ValidacionException(
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
                                .orElseThrow(() -> new RecursoNoEncontradoException(
                                                "Usuario no encontrado"));

                if (nuevoRol == null || nuevoRol.isBlank()) {
                        throw new ValidacionException(
                                        "El rol es obligatorio");
                }

                String nombreRol = nuevoRol.trim().toUpperCase();

                if (!nombreRol.equals("ADMIN")
                                && !nombreRol.equals("SECRETARIA")
                                && !nombreRol.equals("SENSEI")
                                && !nombreRol.equals("ESTUDIANTE")) {

                        throw new ValidacionException(
                                        "Rol no válido. Use ADMIN, SECRETARIA, SENSEI o ESTUDIANTE");
                }

                Rol rol = rolRepository.findByNombre(nombreRol)
                                .orElseThrow(() -> new RecursoNoEncontradoException(
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
                        throw new ValidacionException(
                                        "El estudianteId es obligatorio");
                }

                if (username == null || username.isBlank()) {
                        throw new ValidacionException(
                                        "El username es obligatorio");
                }

                username = username.trim();

                if (username.length() < 4 || username.length() > 30) {
                        throw new ValidacionException(
                                        "El username debe tener entre 4 y 30 caracteres");
                }

                if (!username.matches("[a-zA-Z0-9._-]+")) {
                        throw new ValidacionException(
                                        "El username solo puede contener letras, números, punto, guion y guion bajo");
                }

                if (password == null || password.isBlank()) {
                        throw new ValidacionException(
                                        "La contraseña es obligatoria");
                }

                if (password.length() < 8 || password.length() > 72) {
                        throw new ValidacionException(
                                        "La contraseña debe tener entre 8 y 72 caracteres");
                }

                if (genero == null || genero.isBlank()) {
                        throw new ValidacionException(
                                        "El género es obligatorio");
                }

                genero = genero.trim();

                if (usuarioRepository.findByUsername(username).isPresent()) {

                        throw new DatoDuplicadoException(
                                        "El username ya está registrado");
                }

                Estudiante estudiante = estudianteRepository.findById(
                                estudianteId)
                                .orElseThrow(() -> new RecursoNoEncontradoException(
                                                "Estudiante no encontrado"));

                Persona persona = estudiante.getPersona();

                if (persona == null) {

                        throw new ValidacionException(
                                        "El estudiante no tiene una persona asociada");
                }

                /*
                 * Verificamos si la Persona ya tiene
                 * una cuenta de usuario.
                 */
                if (usuarioRepository.findByPersona(persona).isPresent()) {

                        throw new DatoDuplicadoException(
                                        "La persona ya tiene una cuenta de usuario");
                }

                /*
                 * ==============================
                 * ACTUALIZAR GÉNERO
                 * ==============================
                 */

                persona.setGenero(genero);

                persona = personaRepository.save(persona);

                /*
                 * ==============================
                 * ROL ESTUDIANTE
                 * ==============================
                 */

                Rol rolEstudiante = rolRepository.findByNombre("ESTUDIANTE")
                                .orElseThrow(() -> new RecursoNoEncontradoException(
                                                "Rol ESTUDIANTE no encontrado"));

                /*
                 * ==============================
                 * CREAR USUARIO
                 * ==============================
                 */

                Usuario usuario = new Usuario();

                usuario.setUsername(username);

                usuario.setPassword(
                                passwordEncoder.encode(password));

                /*
                 * Misma Persona.
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

                if (username == null || username.isBlank()) {
                        throw new ValidacionException(
                                        "El username es obligatorio");
                }

                return usuarioRepository.findByUsername(username.trim())
                                .orElseThrow(() -> new RecursoNoEncontradoException(
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

                if (usernameActual == null || usernameActual.isBlank()) {

                        throw new ValidacionException(
                                        "El username actual es obligatorio");
                }

                Usuario usuario = usuarioRepository.findByUsername(
                                usernameActual.trim())
                                .orElseThrow(() -> new RecursoNoEncontradoException(
                                                "Usuario no encontrado"));

                Persona persona = usuario.getPersona();

                if (persona == null) {

                        throw new ValidacionException(
                                        "El usuario no tiene una persona asociada");
                }

                Long personaId = persona.getId();

                /*
                 * ==============================
                 * VALIDACIONES
                 * ==============================
                 */

                if (nuevoUsername == null
                                || nuevoUsername.isBlank()) {

                        throw new ValidacionException(
                                        "El username es obligatorio");
                }

                nuevoUsername = nuevoUsername.trim();

                if (nuevoUsername.length() < 4
                                || nuevoUsername.length() > 30) {

                        throw new ValidacionException(
                                        "El username debe tener entre 4 y 30 caracteres");
                }

                if (!nuevoUsername.matches("[a-zA-Z0-9._-]+")) {

                        throw new ValidacionException(
                                        "El username solo puede contener letras, números, punto, guion y guion bajo");
                }

                if (nombre == null || nombre.isBlank()) {

                        throw new ValidacionException(
                                        "El nombre es obligatorio");
                }

                nombre = nombre.trim();

                if (nombre.length() > 50) {

                        throw new ValidacionException(
                                        "El nombre no puede superar los 50 caracteres");
                }

                if (!nombre.matches("[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+")) {

                        throw new ValidacionException(
                                        "El nombre solo puede contener letras y espacios");
                }

                if (apellido == null || apellido.isBlank()) {

                        throw new ValidacionException(
                                        "El apellido es obligatorio");
                }

                apellido = apellido.trim();

                if (apellido.length() > 50) {

                        throw new ValidacionException(
                                        "El apellido no puede superar los 50 caracteres");
                }

                if (!apellido.matches("[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+")) {

                        throw new ValidacionException(
                                        "El apellido solo puede contener letras y espacios");
                }

                if (correo == null || correo.isBlank()) {

                        throw new ValidacionException(
                                        "El correo es obligatorio");
                }

                correo = correo.trim();

                /*
                 * ==============================
                 * USERNAME
                 * ==============================
                 */

                usuarioRepository.findByUsername(
                                nuevoUsername)
                                .ifPresent(usuarioExistente -> {

                                        if (!usuarioExistente.getId()
                                                        .equals(usuario.getId())) {

                                                throw new DatoDuplicadoException(
                                                                "El username ya existe");
                                        }
                                });

                /*
                 * ==============================
                 * CORREO GLOBAL
                 * ==============================
                 */

                if (persona.getCorreo() == null
                                || !persona.getCorreo()
                                                .equalsIgnoreCase(correo)) {

                        personaRepository.findByCorreo(
                                        correo)
                                        .ifPresent(personaExistente -> {

                                                if (!personaExistente.getId()
                                                                .equals(personaId)) {

                                                        throw new DatoDuplicadoException(
                                                                        "El correo ya existe");
                                                }
                                        });
                }

                /*
                 * ==============================
                 * ACTUALIZAR PERSONA
                 * ==============================
                 */

                persona.setNombre(nombre);
                persona.setApellido(apellido);
                persona.setCorreo(correo);

                /*
                 * ==============================
                 * FOTO
                 * ==============================
                 */

                if (foto != null && !foto.isEmpty()) {

                        validarFotoPerfil(foto);

                        String extension = obtenerExtensionFoto(
                                        foto.getOriginalFilename());

                        String nuevaRuta = "usuarios/"
                                        + usuario.getId()
                                        + "/perfil"
                                        + extension;

                        String fotoAnterior = persona.getFoto();

                        try {

                                /*
                                 * Subimos primero la nueva fotografía.
                                 */
                                String rutaSubida = storageService.subirFoto(
                                                foto,
                                                nuevaRuta);

                                persona.setFoto(rutaSubida);

                                /*
                                 * Eliminamos la anterior después
                                 * de subir correctamente la nueva.
                                 */
                                if (fotoAnterior != null
                                                && !fotoAnterior.isBlank()
                                                && !fotoAnterior.equals(rutaSubida)) {

                                        try {

                                                storageService.eliminarFoto(
                                                                fotoAnterior);

                                        } catch (Exception e) {

                                                System.err.println(
                                                                "No se pudo eliminar la fotografía anterior: "
                                                                                + e.getMessage());
                                        }
                                }

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

                usuario.setUsername(nuevoUsername);

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

                        throw new ValidacionException(
                                        "La fotografía debe ser JPG, PNG o WEBP");
                }

                long tamanioMaximo = 5 * 1024 * 1024;

                if (foto.getSize() > tamanioMaximo) {

                        throw new ValidacionException(
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

                String extension = nombreArchivo
                                .substring(
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

                if (username == null || username.isBlank()) {

                        throw new ValidacionException(
                                        "El username es obligatorio");
                }

                Usuario usuario = usuarioRepository.findByUsername(
                                username.trim())
                                .orElseThrow(() -> new RecursoNoEncontradoException(
                                                "Usuario no encontrado"));

                if (passwordActual == null
                                || passwordActual.isBlank()) {

                        throw new ValidacionException(
                                        "La contraseña actual es obligatoria");
                }

                if (passwordNueva == null
                                || passwordNueva.isBlank()) {

                        throw new ValidacionException(
                                        "La nueva contraseña es obligatoria");
                }

                if (passwordNueva.length() < 8
                                || passwordNueva.length() > 72) {

                        throw new ValidacionException(
                                        "La nueva contraseña debe tener entre 8 y 72 caracteres");
                }

                if (!passwordEncoder.matches(
                                passwordActual,
                                usuario.getPassword())) {

                        throw new ValidacionException(
                                        "La contraseña actual es incorrecta");
                }

                usuario.setPassword(
                                passwordEncoder.encode(passwordNueva));

                return usuarioRepository.save(usuario);
        }
}