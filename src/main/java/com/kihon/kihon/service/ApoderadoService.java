package com.kihon.kihon.service;

import com.kihon.kihon.model.Apoderado;
import com.kihon.kihon.model.Estudiante;
import com.kihon.kihon.model.EstudianteApoderado;
import com.kihon.kihon.repository.ApoderadoRepository;
import com.kihon.kihon.repository.EstudianteApoderadoRepository;
import com.kihon.kihon.repository.EstudianteRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;

@Service
public class ApoderadoService {

    private final ApoderadoRepository apoderadoRepository;
    private final EstudianteApoderadoRepository estudianteApoderadoRepository;
    private final EstudianteRepository estudianteRepository;

    public ApoderadoService(
            ApoderadoRepository apoderadoRepository,
            EstudianteApoderadoRepository estudianteApoderadoRepository,
            EstudianteRepository estudianteRepository) {

        this.apoderadoRepository = apoderadoRepository;
        this.estudianteApoderadoRepository = estudianteApoderadoRepository;
        this.estudianteRepository = estudianteRepository;
    }

    /*
     * ==========================================
     * CREAR / VINCULAR APODERADO
     * ==========================================
     */

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

        Estudiante estudiante = estudianteRepository.findById(estudianteId)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Estudiante no encontrado"));

        // ==============================
        // VERIFICAR EDAD
        // ==============================

        if (!esMenorDeEdad(
                estudiante.getFechaNacimiento())) {

            throw new RuntimeException(
                    "El estudiante es mayor de edad y no necesita apoderado");
        }

        // ==============================
        // VALIDACIONES
        // ==============================

        validarDatos(
                nombre,
                apellido,
                tipoDocumento,
                documento,
                telefono,
                direccion,
                parentesco);

        // ==============================
        // BUSCAR APODERADO EXISTENTE
        // ==============================

        Apoderado apoderado = apoderadoRepository
                .findByDocumento(documento)
                .orElse(null);

        // ==============================
        // CREAR APODERADO
        // ==============================

        if (apoderado == null) {

            apoderado = new Apoderado();

            apoderado.setNombre(nombre);

            apoderado.setApellido(apellido);

            apoderado.setTipoDocumento(
                    tipoDocumento);

            apoderado.setDocumento(
                    documento);

            apoderado.setTelefono(
                    telefono);

            apoderado.setCorreo(
                    correo);

            apoderado.setDireccion(
                    direccion);

            apoderado = apoderadoRepository.save(
                    apoderado);

        } else {

            /*
             * Si el apoderado ya existe,
             * actualizamos sus datos.
             */

            apoderado.setNombre(nombre);

            apoderado.setApellido(apellido);

            apoderado.setTipoDocumento(
                    tipoDocumento);

            apoderado.setTelefono(
                    telefono);

            apoderado.setCorreo(
                    correo);

            apoderado.setDireccion(
                    direccion);

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

        relacion.setEstudiante(
                estudiante);

        relacion.setApoderado(
                apoderado);

        relacion.setParentesco(
                parentesco);

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