package com.kihon.kihon.service;

import com.kihon.kihon.model.Apoderado;
import com.kihon.kihon.model.Estudiante;
import com.kihon.kihon.model.EstudianteApoderado;
import com.kihon.kihon.model.Persona;
import com.kihon.kihon.model.TipoDocumento;

import com.kihon.kihon.repository.ApoderadoRepository;
import com.kihon.kihon.repository.EstudianteApoderadoRepository;
import com.kihon.kihon.repository.EstudianteRepository;
import com.kihon.kihon.repository.PersonaRepository;
import com.kihon.kihon.repository.TipoDocumentoRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;

@Service
public class ApoderadoService {

        private final ApoderadoRepository apoderadoRepository;
        private final EstudianteApoderadoRepository estudianteApoderadoRepository;
        private final EstudianteRepository estudianteRepository;
        private final TipoDocumentoRepository tipoDocumentoRepository;
        private final PersonaRepository personaRepository;

        public ApoderadoService(
                        ApoderadoRepository apoderadoRepository,
                        EstudianteApoderadoRepository estudianteApoderadoRepository,
                        EstudianteRepository estudianteRepository,
                        TipoDocumentoRepository tipoDocumentoRepository,
                        PersonaRepository personaRepository) {

                this.apoderadoRepository = apoderadoRepository;
                this.estudianteApoderadoRepository = estudianteApoderadoRepository;
                this.estudianteRepository = estudianteRepository;
                this.tipoDocumentoRepository = tipoDocumentoRepository;
                this.personaRepository = personaRepository;
        }

        /*
         * ==========================================
         * CREAR / VINCULAR APODERADO
         * ==========================================
         */

        @Transactional
        public EstudianteApoderado crearApoderado(

                        Long estudianteId,

                        String nombre,

                        String apellido,

                        String tipoDocumento,

                        String documento,

                        String telefono,

                        String correo,

                        String direccion,

                        String parentesco) {

                // ==============================
                // BUSCAR ESTUDIANTE
                // ==============================

                Estudiante estudiante = estudianteRepository
                                .findById(estudianteId)
                                .orElseThrow(
                                                () -> new RuntimeException(
                                                                "Estudiante no encontrado"));

                // ==============================
                // VERIFICAR EDAD
                // ==============================

                Persona personaEstudiante = estudiante.getPersona();

                if (personaEstudiante == null) {
                        throw new RuntimeException(
                                        "El estudiante no tiene una persona asociada");
                }

                if (!esMenorDeEdad(
                                personaEstudiante.getFechaNacimiento())) {

                        throw new RuntimeException(
                                        "El estudiante es mayor de edad y no necesita apoderado");
                }

                // ==============================
                // VALIDAR DATOS
                // ==============================

                validarDatos(
                                nombre,
                                apellido,
                                tipoDocumento,
                                documento,
                                telefono,
                                correo,
                                direccion,
                                parentesco);

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
                parentesco = parentesco.trim();

                // ==============================
                // BUSCAR TIPO DE DOCUMENTO
                // ==============================

                TipoDocumento tipoDocumentoEntidad = tipoDocumentoRepository
                                .findByNombre(tipoDocumento)
                                .orElseThrow(
                                                () -> new RuntimeException(
                                                                "El tipo de documento no existe"));

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

                        // ------------------------------
                        // VALIDAR CORREO
                        // ------------------------------

                        if (!correo.equalsIgnoreCase(
                                        persona.getCorreo())) {

                                throw new RuntimeException(
                                                "El correo no coincide con la persona existente");
                        }

                } else {

                        // ==============================
                        // VALIDAR CORREO GLOBAL
                        // ==============================

                        Persona personaPorCorreo = personaRepository
                                        .findByCorreo(correo)
                                        .orElse(null);

                        if (personaPorCorreo != null) {

                                throw new RuntimeException(
                                                "El correo ya está registrado para otra persona");
                        }

                        // ==============================
                        // CREAR PERSONA
                        // ==============================

                        persona = new Persona();

                        persona.setNombre(nombre);
                        persona.setApellido(apellido);
                        persona.setTipoDocumento(
                                        tipoDocumentoEntidad);
                        persona.setNumeroDocumento(documento);
                        persona.setTelefono(telefono);
                        persona.setCorreo(correo);
                        persona.setDireccion(direccion);

                        persona = personaRepository.save(persona);
                }

                // ==============================
                // BUSCAR / CREAR APODERADO
                // ==============================

                Apoderado apoderado = apoderadoRepository
                                .findByPersona(persona)
                                .orElse(null);

                if (apoderado == null) {

                        apoderado = new Apoderado();

                        /*
                         * Los datos personales pertenecen a Persona.
                         *
                         * Apoderado solamente representa
                         * el rol de apoderado.
                         */
                        apoderado.setPersona(persona);

                        apoderado = apoderadoRepository.save(
                                        apoderado);
                }

                // ==============================
                // VERIFICAR RELACIÓN EXISTENTE
                // ==============================

                if (estudianteApoderadoRepository
                                .findByEstudianteIdAndApoderadoId(
                                                estudianteId,
                                                apoderado.getId())
                                .isPresent()) {

                        throw new RuntimeException(
                                        "El estudiante ya tiene vinculado este apoderado");
                }

                // ==============================
                // CREAR RELACIÓN
                // ==============================

                EstudianteApoderado relacion = new EstudianteApoderado();

                relacion.setEstudiante(estudiante);

                relacion.setApoderado(apoderado);

                relacion.setParentesco(parentesco);

                return estudianteApoderadoRepository
                                .save(relacion);
        }

        /*
         * ==========================================
         * LISTAR APODERADOS DE UN ESTUDIANTE
         * ==========================================
         */

        public List<EstudianteApoderado> listarPorEstudiante(
                        Long estudianteId) {

                if (!estudianteRepository
                                .existsById(estudianteId)) {

                        throw new RuntimeException(
                                        "Estudiante no encontrado");
                }

                return estudianteApoderadoRepository
                                .findByEstudianteId(
                                                estudianteId);
        }

        /*
         * ==========================================
         * VERIFICAR SI ES MENOR
         * ==========================================
         */

        private boolean esMenorDeEdad(
                        LocalDate fechaNacimiento) {

                if (fechaNacimiento == null) {

                        throw new RuntimeException(
                                        "La fecha de nacimiento es obligatoria");
                }

                int edad = Period.between(
                                fechaNacimiento,
                                LocalDate.now())
                                .getYears();

                return edad < 18;
        }

        /*
         * ==========================================
         * VALIDAR DATOS
         * ==========================================
         */

        private void validarDatos(

                        String nombre,

                        String apellido,

                        String tipoDocumento,

                        String documento,

                        String telefono,

                        String correo,

                        String direccion,

                        String parentesco) {

                if (nombre == null
                                || nombre.isBlank()) {

                        throw new RuntimeException(
                                        "El nombre del apoderado es obligatorio");
                }

                if (apellido == null
                                || apellido.isBlank()) {

                        throw new RuntimeException(
                                        "El apellido del apoderado es obligatorio");
                }

                if (tipoDocumento == null
                                || tipoDocumento.isBlank()) {

                        throw new RuntimeException(
                                        "El tipo de documento del apoderado es obligatorio");
                }

                if (documento == null
                                || documento.isBlank()) {

                        throw new RuntimeException(
                                        "El documento del apoderado es obligatorio");
                }

                if (telefono == null
                                || telefono.isBlank()) {

                        throw new RuntimeException(
                                        "El teléfono del apoderado es obligatorio");
                }

                if (correo == null
                                || correo.isBlank()) {

                        throw new RuntimeException(
                                        "El correo del apoderado es obligatorio");
                }

                if (direccion == null
                                || direccion.isBlank()) {

                        throw new RuntimeException(
                                        "La dirección del apoderado es obligatoria");
                }

                if (parentesco == null
                                || parentesco.isBlank()) {

                        throw new RuntimeException(
                                        "El parentesco es obligatorio");
                }
        }
}