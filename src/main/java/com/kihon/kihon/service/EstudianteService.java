package com.kihon.kihon.service;

import com.kihon.kihon.model.Estudiante;
import com.kihon.kihon.repository.EstudianteRepository;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@Service
public class EstudianteService {

        private final EstudianteRepository estudianteRepository;
        private final SupabaseStorageService storageService;

        public EstudianteService(
                        EstudianteRepository estudianteRepository,
                        SupabaseStorageService storageService) {

                this.estudianteRepository = estudianteRepository;
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

                if (tipoDocumento == null
                                || tipoDocumento.isBlank()) {

                        throw new RuntimeException(
                                        "El tipo de documento es obligatorio");
                }

                if (documento == null
                                || documento.isBlank()) {

                        throw new RuntimeException(
                                        "El documento es obligatorio");
                }

                if (telefono == null
                                || telefono.isBlank()) {

                        throw new RuntimeException(
                                        "El teléfono es obligatorio");
                }

                if (correo == null
                                || correo.isBlank()) {

                        throw new RuntimeException(
                                        "El correo es obligatorio");
                }

                if (fechaNacimiento == null) {

                        throw new RuntimeException(
                                        "La fecha de nacimiento es obligatoria");
                }

                if (direccion == null
                                || direccion.isBlank()) {

                        throw new RuntimeException(
                                        "La dirección es obligatoria");
                }

                if (cinturon == null
                                || cinturon.isBlank()) {

                        throw new RuntimeException(
                                        "El cinturón es obligatorio");
                }

                // ==============================
                // DOCUMENTO ÚNICO
                // ==============================

                if (estudianteRepository
                                .findByDocumento(documento)
                                .isPresent()) {

                        throw new RuntimeException(
                                        "El documento ya existe");
                }

                // ==============================
                // CORREO ÚNICO
                // ==============================

                if (estudianteRepository
                                .findByCorreo(correo)
                                .isPresent()) {

                        throw new RuntimeException(
                                        "El correo ya existe");
                }

                // ==============================
                // CREAR ESTUDIANTE
                // ==============================

                Estudiante estudiante = new Estudiante();

                estudiante.setNombre(nombre);

                estudiante.setApellido(apellido);

                estudiante.setTipoDocumento(tipoDocumento);

                estudiante.setDocumento(documento);

                estudiante.setTelefono(telefono);

                estudiante.setCorreo(correo);

                estudiante.setFechaNacimiento(
                                fechaNacimiento);

                estudiante.setDireccion(direccion);

                estudiante.setCinturon(cinturon);

                estudiante.setEstado("ACTIVO");

                // ==============================
                // GUARDAR PARA OBTENER ID
                // ==============================

                estudiante = estudianteRepository.save(
                                estudiante);

                // ==============================
                // GUARDAR FOTOGRAFÍA
                // ==============================

                if (foto != null && !foto.isEmpty()) {

                        try {

                                validarFoto(foto);

                                String extension = obtenerExtension(
                                                foto.getOriginalFilename());

                                String ruta = "estudiantes/"
                                                + estudiante.getId()
                                                + "/perfil"
                                                + extension;

                                storageService.subirFoto(
                                                foto,
                                                ruta);

                                estudiante.setFoto(ruta);

                                estudiante = estudianteRepository.save(
                                                estudiante);

                        } catch (Exception e) {

                                /*
                                 * Si falla la fotografía,
                                 * eliminamos el estudiante
                                 * que acabamos de crear.
                                 */

                                estudianteRepository.delete(
                                                estudiante);

                                throw new RuntimeException(
                                                "No se pudo guardar la fotografía: "
                                                                + e.getMessage());
                        }
                }

                return estudiante;
        }

        /*
         * ==========================================
         * ACTUALIZAR ESTUDIANTE
         * ==========================================
         */

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
                                .orElseThrow(
                                                () -> new RuntimeException(
                                                                "Estudiante no encontrado"));

                // ==============================
                // VALIDACIONES
                // ==============================

                if (nombre == null
                                || nombre.isBlank()) {

                        throw new RuntimeException(
                                        "El nombre es obligatorio");
                }

                if (apellido == null
                                || apellido.isBlank()) {

                        throw new RuntimeException(
                                        "El apellido es obligatorio");
                }

                if (documento == null
                                || documento.isBlank()) {

                        throw new RuntimeException(
                                        "El documento es obligatorio");
                }

                if (telefono == null
                                || telefono.isBlank()) {

                        throw new RuntimeException(
                                        "El teléfono es obligatorio");
                }

                if (correo == null
                                || correo.isBlank()) {

                        throw new RuntimeException(
                                        "El correo es obligatorio");
                }

                if (cinturon == null
                                || cinturon.isBlank()) {

                        throw new RuntimeException(
                                        "El cinturón es obligatorio");
                }

                // ==============================
                // DOCUMENTO ÚNICO
                // ==============================

                if (!estudiante
                                .getDocumento()
                                .equals(documento)

                                && estudianteRepository
                                                .findByDocumento(documento)
                                                .isPresent()) {

                        throw new RuntimeException(
                                        "El documento ya existe");
                }

                // ==============================
                // CORREO ÚNICO
                // ==============================

                if (!estudiante
                                .getCorreo()
                                .equals(correo)

                                && estudianteRepository
                                                .findByCorreo(correo)
                                                .isPresent()) {

                        throw new RuntimeException(
                                        "El correo ya existe");
                }

                // ==============================
                // ACTUALIZAR DATOS
                // ==============================

                estudiante.setNombre(nombre);

                estudiante.setApellido(apellido);

                estudiante.setDocumento(documento);

                estudiante.setTelefono(telefono);

                estudiante.setCorreo(correo);

                estudiante.setCinturon(cinturon);

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

                                /*
                                 * Si existe una fotografía anterior
                                 * y tiene una ruta diferente,
                                 * la eliminamos.
                                 */

                                if (estudiante.getFoto() != null
                                                && !estudiante.getFoto().isBlank()
                                                && !estudiante.getFoto()
                                                                .equals(nuevaRuta)) {

                                        storageService.eliminarFoto(
                                                        estudiante.getFoto());
                                }

                                /*
                                 * Subimos la nueva fotografía.
                                 */

                                storageService.subirFoto(
                                                foto,
                                                nuevaRuta);

                                estudiante.setFoto(
                                                nuevaRuta);

                        } catch (Exception e) {

                                throw new RuntimeException(
                                                "No se pudo actualizar la fotografía: "
                                                                + e.getMessage());
                        }
                }

                // ==============================
                // QUITAR FOTOGRAFÍA
                // ==============================

                else if (quitarFoto
                                && estudiante.getFoto() != null
                                && !estudiante.getFoto().isBlank()) {

                        try {

                                storageService.eliminarFoto(
                                                estudiante.getFoto());

                                estudiante.setFoto(null);

                        } catch (Exception e) {

                                throw new RuntimeException(
                                                "No se pudo eliminar la fotografía: "
                                                                + e.getMessage());
                        }
                }

                // ==============================
                // GUARDAR
                // ==============================

                return estudianteRepository.save(
                                estudiante);
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
                                || (!tipoContenido.equals(
                                                "image/jpeg")

                                                && !tipoContenido.equals(
                                                                "image/png")

                                                && !tipoContenido.equals(
                                                                "image/webp"))) {

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

        public Estudiante cambiarEstado(

                        Long id,

                        String estado) {

                Estudiante estudiante = estudianteRepository.findById(id)
                                .orElseThrow(
                                                () -> new RuntimeException(
                                                                "Estudiante no encontrado"));

                if (!estado.equals("ACTIVO")
                                && !estado.equals("INACTIVO")) {

                        throw new RuntimeException(
                                        "El estado debe ser ACTIVO o INACTIVO");
                }

                estudiante.setEstado(
                                estado);

                return estudianteRepository.save(
                                estudiante);
        }

        /*
         * ==========================================
         * LISTAR POR ESTADO
         * ==========================================
         */

        public List<Estudiante> listarPorEstado(
                        String estado) {

                if (!estado.equals("ACTIVO")
                                && !estado.equals("INACTIVO")) {

                        throw new RuntimeException(
                                        "El estado debe ser ACTIVO o INACTIVO");
                }

                return estudianteRepository
                                .findByEstado(estado);
        }
}