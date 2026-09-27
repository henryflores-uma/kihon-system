package com.kihon.kihon.service;

import com.kihon.kihon.model.Cinturon;
import com.kihon.kihon.model.Estudiante;
import com.kihon.kihon.model.Persona;
import com.kihon.kihon.model.TipoDocumento;
import com.kihon.kihon.repository.CinturonRepository;
import com.kihon.kihon.repository.EstudianteRepository;
import com.kihon.kihon.repository.PersonaRepository;
import com.kihon.kihon.repository.TipoDocumentoRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@Service
public class EstudianteService {

        private final EstudianteRepository estudianteRepository;
        private final PersonaRepository personaRepository;
        private final TipoDocumentoRepository tipoDocumentoRepository;
        private final CinturonRepository cinturonRepository;
        private final SupabaseStorageService storageService;

        public EstudianteService(
                        EstudianteRepository estudianteRepository,
                        PersonaRepository personaRepository,
                        TipoDocumentoRepository tipoDocumentoRepository,
                        CinturonRepository cinturonRepository,
                        SupabaseStorageService storageService) {

                this.estudianteRepository = estudianteRepository;
                this.personaRepository = personaRepository;
                this.tipoDocumentoRepository = tipoDocumentoRepository;
                this.cinturonRepository = cinturonRepository;
                this.storageService = storageService;
        }

        /*
         * ==========================================
         * LISTAR TODOS
         * ==========================================
         */
        public List<Estudiante> listarEstudiantes() {

                return estudianteRepository.findAll();
        }

        /*
         * ==========================================
         * BUSCAR POR ID
         * ==========================================
         */
        public Estudiante buscarPorId(Long id) {

                return estudianteRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException(
                                                "Estudiante no encontrado"));
        }

        /*
         * ==========================================
         * CREAR ESTUDIANTE
         * ==========================================
         */
        @Transactional
        public Estudiante crearEstudiante(
                        String nombre,
                        String apellido,
                        String tipoDocumento,
                        String documento,
                        String telefono,
                        String correo,
                        LocalDate fechaNacimiento,
                        String direccion,
                        String cinturon,
                        MultipartFile foto) {

                // ==============================
                // VALIDACIONES
                // ==============================

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

                if (documento == null || documento.isBlank()) {
                        throw new RuntimeException(
                                        "El documento es obligatorio");
                }

                if (telefono == null || telefono.isBlank()) {
                        throw new RuntimeException(
                                        "El teléfono es obligatorio");
                }

                if (correo == null || correo.isBlank()) {
                        throw new RuntimeException(
                                        "El correo es obligatorio");
                }

                if (fechaNacimiento == null) {
                        throw new RuntimeException(
                                        "La fecha de nacimiento es obligatoria");
                }

                if (direccion == null || direccion.isBlank()) {
                        throw new RuntimeException(
                                        "La dirección es obligatoria");
                }

                if (cinturon == null || cinturon.isBlank()) {
                        throw new RuntimeException(
                                        "El cinturón es obligatorio");
                }

                // ==============================
                // NORMALIZAR DATOS
                // ==============================

                nombre = nombre.trim();
                apellido = apellido.trim();
                tipoDocumento = tipoDocumento.trim().toUpperCase();
                documento = documento.trim();
                telefono = telefono.trim();
                correo = correo.trim().toLowerCase();
                direccion = direccion.trim();
                cinturon = cinturon.trim().toUpperCase();

                // ==============================
                // BUSCAR TIPO DE DOCUMENTO
                // ==============================

                TipoDocumento tipoDocumentoEntidad = tipoDocumentoRepository.findByNombre(tipoDocumento)
                                .orElseThrow(() -> new RuntimeException(
                                                "El tipo de documento no existe"));

                // ==============================
                // BUSCAR CINTURÓN
                // ==============================

                Cinturon cinturonEntidad = cinturonRepository.findByNombre(cinturon)
                                .orElseThrow(() -> new RuntimeException(
                                                "El cinturón no existe"));

                // ==============================
                // BUSCAR PERSONA POR DOCUMENTO
                // ==============================

                Persona persona = personaRepository
                                .findByTipoDocumentoIdAndNumeroDocumento(
                                                tipoDocumentoEntidad.getId(),
                                                documento)
                                .orElse(null);

                // ==============================
                // PERSONA EXISTENTE
                // ==============================

                if (persona != null) {

                        /*
                         * La persona ya existe.
                         *
                         * Puede ser estudiante, usuario,
                         * apoderado o una combinación de roles.
                         */

                        if (!persona.getCorreo()
                                        .equalsIgnoreCase(correo)) {

                                throw new RuntimeException(
                                                "El documento ya está registrado con otro correo");
                        }

                        /*
                         * Verificar que la persona todavía
                         * no tenga un registro de estudiante.
                         */
                        if (estudianteRepository
                                        .findByPersona(persona)
                                        .isPresent()) {

                                throw new RuntimeException(
                                                "El documento ya existe");
                        }

                        /*
                         * Actualizar información personal
                         * de la persona existente.
                         */
                        persona.setNombre(nombre);
                        persona.setApellido(apellido);
                        persona.setTelefono(telefono);
                        persona.setFechaNacimiento(fechaNacimiento);
                        persona.setDireccion(direccion);

                        persona = personaRepository.save(persona);
                }

                // ==============================
                // PERSONA NUEVA
                // ==============================

                else {

                        /*
                         * El correo debe ser único globalmente.
                         */
                        if (personaRepository
                                        .findByCorreo(correo)
                                        .isPresent()) {

                                throw new RuntimeException(
                                                "El correo ya existe");
                        }

                        persona = new Persona();

                        persona.setNombre(nombre);
                        persona.setApellido(apellido);
                        persona.setTipoDocumento(
                                        tipoDocumentoEntidad);
                        persona.setNumeroDocumento(documento);
                        persona.setTelefono(telefono);
                        persona.setCorreo(correo);
                        persona.setFechaNacimiento(fechaNacimiento);
                        persona.setDireccion(direccion);

                        persona = personaRepository.save(persona);
                }

                // ==============================
                // CREAR ESTUDIANTE
                // ==============================

                Estudiante estudiante = new Estudiante();

                /*
                 * Persona es la identidad del estudiante.
                 */
                estudiante.setPersona(persona);

                /*
                 * Datos propios del estudiante.
                 */
                estudiante.setCinturon(cinturonEntidad);
                estudiante.setEstado("ACTIVO");

                // ==============================
                // GUARDAR ESTUDIANTE
                // ==============================

                estudiante = estudianteRepository.save(estudiante);

                // ==============================
                // GUARDAR FOTOGRAFÍA
                // ==============================

                if (foto != null && !foto.isEmpty()) {

                        String ruta = null;

                        try {

                                validarFoto(foto);

                                String extension = obtenerExtension(
                                                foto.getOriginalFilename());

                                ruta = "estudiantes/"
                                                + estudiante.getId()
                                                + "/perfil"
                                                + extension;

                                storageService.subirFoto(
                                                foto,
                                                ruta);

                                /*
                                 * La fotografía pertenece a Persona.
                                 */
                                persona.setFoto(ruta);

                                personaRepository.save(persona);

                        } catch (Exception e) {

                                /*
                                 * Si la subida llegó a realizarse,
                                 * intentamos eliminarla.
                                 */
                                if (ruta != null) {

                                        try {

                                                storageService.eliminarFoto(
                                                                ruta);

                                        } catch (Exception ignored) {
                                        }
                                }

                                throw new RuntimeException(
                                                "No se pudo guardar la fotografía: "
                                                                + e.getMessage(),
                                                e);
                        }
                }

                return estudiante;
        }

        /*
         * ==========================================
         * ACTUALIZAR ESTUDIANTE
         * ==========================================
         */
        @Transactional
        public Estudiante actualizarEstudiante(
                        Long id,
                        String nombre,
                        String apellido,
                        String documento,
                        String telefono,
                        String correo,
                        String cinturon,
                        MultipartFile foto,
                        boolean quitarFoto) {

                // ==============================
                // BUSCAR ESTUDIANTE
                // ==============================

                Estudiante estudiante = estudianteRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException(
                                                "Estudiante no encontrado"));

                // ==============================
                // VALIDACIONES
                // ==============================

                if (nombre == null || nombre.isBlank()) {
                        throw new RuntimeException(
                                        "El nombre es obligatorio");
                }

                if (apellido == null || apellido.isBlank()) {
                        throw new RuntimeException(
                                        "El apellido es obligatorio");
                }

                if (documento == null || documento.isBlank()) {
                        throw new RuntimeException(
                                        "El documento es obligatorio");
                }

                if (telefono == null || telefono.isBlank()) {
                        throw new RuntimeException(
                                        "El teléfono es obligatorio");
                }

                if (correo == null || correo.isBlank()) {
                        throw new RuntimeException(
                                        "El correo es obligatorio");
                }

                if (cinturon == null || cinturon.isBlank()) {
                        throw new RuntimeException(
                                        "El cinturón es obligatorio");
                }

                // ==============================
                // NORMALIZAR DATOS
                // ==============================

                nombre = nombre.trim();
                apellido = apellido.trim();
                documento = documento.trim();
                telefono = telefono.trim();
                correo = correo.trim().toLowerCase();
                cinturon = cinturon.trim().toUpperCase();

                // ==============================
                // PERSONA ACTUAL
                // ==============================

                Persona persona = estudiante.getPersona();

                if (persona == null) {

                        throw new RuntimeException(
                                        "El estudiante no tiene una persona asociada");
                }

                Long personaId = persona.getId();

                // ==============================
                // TIPO DE DOCUMENTO
                // ==============================

                TipoDocumento tipoDocumentoEntidad = persona.getTipoDocumento();

                if (tipoDocumentoEntidad == null) {

                        throw new RuntimeException(
                                        "El estudiante no tiene un tipo de documento asociado");
                }

                // ==============================
                // VALIDAR DOCUMENTO
                // ==============================

                if (!persona.getNumeroDocumento()
                                .equals(documento)) {

                        boolean documentoExiste = personaRepository
                                        .findByTipoDocumentoIdAndNumeroDocumento(
                                                        tipoDocumentoEntidad.getId(),
                                                        documento)
                                        .filter(personaEncontrada -> !personaEncontrada
                                                        .getId()
                                                        .equals(personaId))
                                        .isPresent();

                        if (documentoExiste) {

                                throw new RuntimeException(
                                                "El documento ya existe");
                        }
                }

                // ==============================
                // VALIDAR CORREO
                // ==============================

                if (!persona.getCorreo()
                                .equalsIgnoreCase(correo)) {

                        boolean correoExiste = personaRepository
                                        .findByCorreo(correo)
                                        .filter(personaEncontrada -> !personaEncontrada
                                                        .getId()
                                                        .equals(personaId))
                                        .isPresent();

                        if (correoExiste) {

                                throw new RuntimeException(
                                                "El correo ya existe");
                        }
                }

                // ==============================
                // BUSCAR CINTURÓN
                // ==============================

                Cinturon cinturonEntidad = cinturonRepository.findByNombre(cinturon)
                                .orElseThrow(() -> new RuntimeException(
                                                "El cinturón no existe"));

                // ==============================
                // ACTUALIZAR PERSONA
                // ==============================

                persona.setNombre(nombre);
                persona.setApellido(apellido);
                persona.setNumeroDocumento(documento);
                persona.setTelefono(telefono);
                persona.setCorreo(correo);

                persona = personaRepository.save(persona);

                // ==============================
                // ACTUALIZAR ESTUDIANTE
                // ==============================

                estudiante.setCinturon(cinturonEntidad);

                // ==============================
                // CAMBIAR FOTOGRAFÍA
                // ==============================

                if (foto != null && !foto.isEmpty()) {

                        try {

                                validarFoto(foto);

                                String extension = obtenerExtension(
                                                foto.getOriginalFilename());

                                String nuevaRuta = "estudiantes/"
                                                + estudiante.getId()
                                                + "/perfil"
                                                + extension;

                                String fotoAnterior = persona.getFoto();

                                /*
                                 * Subimos primero la nueva fotografía.
                                 */
                                storageService.subirFoto(
                                                foto,
                                                nuevaRuta);

                                /*
                                 * Eliminamos la anterior después
                                 * de subir correctamente la nueva.
                                 */
                                if (fotoAnterior != null
                                                && !fotoAnterior.isBlank()
                                                && !fotoAnterior.equals(nuevaRuta)) {

                                        try {

                                                storageService.eliminarFoto(
                                                                fotoAnterior);

                                        } catch (Exception ignored) {
                                        }
                                }

                                persona.setFoto(nuevaRuta);

                                personaRepository.save(persona);

                        } catch (Exception e) {

                                throw new RuntimeException(
                                                "No se pudo actualizar la fotografía: "
                                                                + e.getMessage(),
                                                e);
                        }
                }

                // ==============================
                // QUITAR FOTOGRAFÍA
                // ==============================

                else if (quitarFoto
                                && persona.getFoto() != null
                                && !persona.getFoto().isBlank()) {

                        try {

                                storageService.eliminarFoto(
                                                persona.getFoto());

                                persona.setFoto(null);

                                personaRepository.save(persona);

                        } catch (Exception e) {

                                throw new RuntimeException(
                                                "No se pudo eliminar la fotografía: "
                                                                + e.getMessage(),
                                                e);
                        }
                }

                // ==============================
                // GUARDAR
                // ==============================

                return estudianteRepository.save(estudiante);
        }

        /*
         * ==========================================
         * VALIDAR FOTOGRAFÍA
         * ==========================================
         */
        private void validarFoto(
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
         * ==========================================
         * OBTENER EXTENSIÓN
         * ==========================================
         */
        private String obtenerExtension(
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
         * ==========================================
         * CAMBIAR ESTADO
         * ==========================================
         */
        @Transactional
        public Estudiante cambiarEstado(
                        Long id,
                        String estado) {

                Estudiante estudiante = estudianteRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException(
                                                "Estudiante no encontrado"));

                if (estado == null || estado.isBlank()) {

                        throw new RuntimeException(
                                        "El estado es obligatorio");
                }

                estado = estado.trim().toUpperCase();

                if (!estado.equals("ACTIVO")
                                && !estado.equals("INACTIVO")) {

                        throw new RuntimeException(
                                        "El estado debe ser ACTIVO o INACTIVO");
                }

                estudiante.setEstado(estado);

                return estudianteRepository.save(estudiante);
        }

        /*
         * ==========================================
         * LISTAR POR ESTADO
         * ==========================================
         */
        public List<Estudiante> listarPorEstado(
                        String estado) {

                if (estado == null || estado.isBlank()) {

                        throw new RuntimeException(
                                        "El estado es obligatorio");
                }

                estado = estado.trim().toUpperCase();

                if (!estado.equals("ACTIVO")
                                && !estado.equals("INACTIVO")) {

                        throw new RuntimeException(
                                        "El estado debe ser ACTIVO o INACTIVO");
                }

                return estudianteRepository
                                .findByEstado(estado);
        }
}