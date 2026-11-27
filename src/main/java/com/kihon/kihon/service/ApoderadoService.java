
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
         * =========================================================
         * CREAR / VINCULAR APODERADO
         * =========================================================
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

                Estudiante estudiante = estudianteRepository.findById(estudianteId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Estudiante no encontrado"));

                Persona personaEstudiante = estudiante.getPersona();

                if (personaEstudiante == null) {
                        throw new RuntimeException(
                                        "El estudiante no tiene una persona asociada");
                }

                if (!esMenorDeEdad(personaEstudiante.getFechaNacimiento())) {
                        throw new RuntimeException(
                                        "El estudiante es mayor de edad y no necesita apoderado");
                }

                validarDatos(
                                nombre,
                                apellido,
                                tipoDocumento,
                                documento,
                                telefono,
                                correo,
                                direccion,
                                parentesco);

                nombre = nombre.trim();
                apellido = apellido.trim();
                tipoDocumento = tipoDocumento.trim().toUpperCase();
                documento = documento.trim();
                telefono = telefono.trim();
                correo = correo.trim().toLowerCase();
                direccion = direccion.trim();
                parentesco = parentesco.trim();

                TipoDocumento tipoDocumentoEntidad = tipoDocumentoRepository
                                .findByNombre(tipoDocumento)
                                .orElseThrow(() -> new RuntimeException(
                                                "El tipo de documento no existe"));

                Persona persona = personaRepository
                                .findByTipoDocumentoIdAndNumeroDocumento(
                                                tipoDocumentoEntidad.getId(),
                                                documento)
                                .orElse(null);

                if (persona != null) {

                        if (!correo.equalsIgnoreCase(persona.getCorreo())) {
                                throw new RuntimeException(
                                                "El correo no coincide con la persona existente");
                        }

                } else {

                        Persona personaPorCorreo = personaRepository
                                        .findByCorreo(correo)
                                        .orElse(null);

                        if (personaPorCorreo != null) {
                                throw new RuntimeException(
                                                "El correo ya está registrado para otra persona");
                        }

                        persona = new Persona();
                        persona.setNombre(nombre);
                        persona.setApellido(apellido);
                        persona.setTipoDocumento(tipoDocumentoEntidad);
                        persona.setNumeroDocumento(documento);
                        persona.setTelefono(telefono);
                        persona.setCorreo(correo);
                        persona.setDireccion(direccion);

                        persona = personaRepository.save(persona);
                }

                Apoderado apoderado = apoderadoRepository
                                .findByPersona(persona)
                                .orElse(null);

                if (apoderado == null) {
                        apoderado = new Apoderado();
                        apoderado.setPersona(persona);
                        apoderado = apoderadoRepository.save(apoderado);
                }

                if (estudianteApoderadoRepository
                                .findByEstudianteIdAndApoderadoId(
                                                estudianteId,
                                                apoderado.getId())
                                .isPresent()) {

                        throw new RuntimeException(
                                        "El estudiante ya tiene vinculado este apoderado");
                }

                EstudianteApoderado relacion = new EstudianteApoderado();
                relacion.setEstudiante(estudiante);
                relacion.setApoderado(apoderado);
                relacion.setParentesco(parentesco);

                return estudianteApoderadoRepository.save(relacion);
        }

        /*
         * =========================================================
         * LISTAR APODERADOS DE UN ESTUDIANTE
         * =========================================================
         */

        @Transactional(readOnly = true)
        public List<EstudianteApoderado> listarPorEstudiante(
                        Long estudianteId) {

                if (!estudianteRepository.existsById(estudianteId)) {
                        throw new RuntimeException("Estudiante no encontrado");
                }

                return estudianteApoderadoRepository
                                .findByEstudianteId(estudianteId);
        }

        /*
         * =========================================================
         * LISTAR TODOS LOS APODERADOS
         * =========================================================
         */

        @Transactional(readOnly = true)
        public List<Apoderado> listarTodos() {
                return apoderadoRepository.findAll();
        }

        /*
         * =========================================================
         * BUSCAR APODERADO POR ID
         * =========================================================
         */

        @Transactional(readOnly = true)
        public Apoderado buscarPorId(Long apoderadoId) {

                return apoderadoRepository.findById(apoderadoId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Apoderado no encontrado"));
        }

        /*
         * =========================================================
         * LISTAR ESTUDIANTES VINCULADOS A UN APODERADO
         * =========================================================
         */

        @Transactional(readOnly = true)
        public List<EstudianteApoderado> listarEstudiantesPorApoderado(
                        Long apoderadoId) {

                if (!apoderadoRepository.existsById(apoderadoId)) {
                        throw new RuntimeException("Apoderado no encontrado");
                }

                return estudianteApoderadoRepository
                                .findByApoderadoId(apoderadoId);
        }

        /*
         * =========================================================
         * ACTUALIZAR DATOS PERSONALES DEL APODERADO
         * =========================================================
         */

        @Transactional
        public Apoderado actualizarApoderado(
                        Long apoderadoId,
                        String nombre,
                        String apellido,
                        String tipoDocumento,
                        String documento,
                        String telefono,
                        String correo,
                        String direccion) {

                if (nombre == null || nombre.isBlank()) {
                        throw new RuntimeException(
                                        "El nombre del apoderado es obligatorio");
                }

                if (apellido == null || apellido.isBlank()) {
                        throw new RuntimeException(
                                        "El apellido del apoderado es obligatorio");
                }

                if (tipoDocumento == null || tipoDocumento.isBlank()) {
                        throw new RuntimeException(
                                        "El tipo de documento del apoderado es obligatorio");
                }

                if (documento == null || documento.isBlank()) {
                        throw new RuntimeException(
                                        "El documento del apoderado es obligatorio");
                }

                if (telefono == null || telefono.isBlank()) {
                        throw new RuntimeException(
                                        "El teléfono del apoderado es obligatorio");
                }

                if (correo == null || correo.isBlank()) {
                        throw new RuntimeException(
                                        "El correo del apoderado es obligatorio");
                }

                if (direccion == null || direccion.isBlank()) {
                        throw new RuntimeException(
                                        "La dirección del apoderado es obligatoria");
                }

                nombre = nombre.trim();
                apellido = apellido.trim();
                tipoDocumento = tipoDocumento.trim().toUpperCase();
                documento = documento.trim();
                telefono = telefono.trim();
                correo = correo.trim().toLowerCase();
                direccion = direccion.trim();

                Apoderado apoderado = buscarPorId(apoderadoId);
                Persona persona = apoderado.getPersona();

                TipoDocumento tipoDocumentoEntidad = tipoDocumentoRepository
                                .findByNombre(tipoDocumento)
                                .orElseThrow(() -> new RuntimeException(
                                                "El tipo de documento no existe"));

                /*
                 * Verificar que el documento no pertenezca
                 * a otra persona.
                 */

                Persona personaPorDocumento = personaRepository
                                .findByTipoDocumentoIdAndNumeroDocumento(
                                                tipoDocumentoEntidad.getId(),
                                                documento)
                                .orElse(null);

                if (personaPorDocumento != null
                                && !personaPorDocumento.getId().equals(persona.getId())) {

                        throw new RuntimeException(
                                        "El documento ya está registrado para otra persona");
                }

                /*
                 * Verificar que el correo no pertenezca
                 * a otra persona.
                 */

                Persona personaPorCorreo = personaRepository
                                .findByCorreo(correo)
                                .orElse(null);

                if (personaPorCorreo != null
                                && !personaPorCorreo.getId().equals(persona.getId())) {

                        throw new RuntimeException(
                                        "El correo ya está registrado para otra persona");
                }

                /*
                 * Verificar que el teléfono no pertenezca
                 * a otra persona.
                 */

                Persona personaPorTelefono = personaRepository
                                .findByTelefono(telefono)
                                .orElse(null);

                if (personaPorTelefono != null
                                && !personaPorTelefono.getId().equals(persona.getId())) {

                        throw new RuntimeException(
                                        "El teléfono ya está registrado para otra persona");
                }

                persona.setNombre(nombre);
                persona.setApellido(apellido);
                persona.setTipoDocumento(tipoDocumentoEntidad);
                persona.setNumeroDocumento(documento);
                persona.setTelefono(telefono);
                persona.setCorreo(correo);
                persona.setDireccion(direccion);

                personaRepository.save(persona);

                return apoderado;
        }

        /*
         * =========================================================
         * ACTUALIZAR PARENTESCO DE UNA RELACIÓN
         * =========================================================
         */

        @Transactional
        public EstudianteApoderado actualizarParentesco(
                        Long estudianteId,
                        Long apoderadoId,
                        String parentesco) {

                if (parentesco == null || parentesco.isBlank()) {
                        throw new RuntimeException(
                                        "El parentesco es obligatorio");
                }

                EstudianteApoderado relacion = estudianteApoderadoRepository
                                .findByEstudianteIdAndApoderadoId(
                                                estudianteId,
                                                apoderadoId)
                                .orElseThrow(() -> new RuntimeException(
                                                "No existe la relación entre el estudiante y el apoderado"));

                relacion.setParentesco(parentesco.trim());

                return estudianteApoderadoRepository.save(relacion);
        }

        /*
         * =========================================================
         * VERIFICAR SI ES MENOR DE EDAD
         * =========================================================
         */

        private boolean esMenorDeEdad(LocalDate fechaNacimiento) {

                if (fechaNacimiento == null) {
                        throw new RuntimeException(
                                        "La fecha de nacimiento es obligatoria");
                }

                int edad = Period.between(
                                fechaNacimiento,
                                LocalDate.now()).getYears();

                return edad < 18;
        }

        /*
         * =========================================================
         * VALIDAR DATOS PARA EL REGISTRO
         * =========================================================
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

                if (nombre == null || nombre.isBlank()) {
                        throw new RuntimeException(
                                        "El nombre del apoderado es obligatorio");
                }

                if (apellido == null || apellido.isBlank()) {
                        throw new RuntimeException(
                                        "El apellido del apoderado es obligatorio");
                }

                if (tipoDocumento == null || tipoDocumento.isBlank()) {
                        throw new RuntimeException(
                                        "El tipo de documento del apoderado es obligatorio");
                }

                if (documento == null || documento.isBlank()) {
                        throw new RuntimeException(
                                        "El documento del apoderado es obligatorio");
                }

                if (telefono == null || telefono.isBlank()) {
                        throw new RuntimeException(
                                        "El teléfono del apoderado es obligatorio");
                }

                if (correo == null || correo.isBlank()) {
                        throw new RuntimeException(
                                        "El correo del apoderado es obligatorio");
                }

                if (direccion == null || direccion.isBlank()) {
                        throw new RuntimeException(
                                        "La dirección del apoderado es obligatoria");
                }

                if (parentesco == null || parentesco.isBlank()) {
                        throw new RuntimeException(
                                        "El parentesco es obligatorio");
                }
        }
}
