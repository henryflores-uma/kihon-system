package com.kihon.kihon.service;

import com.kihon.kihon.model.Estudiante;
import com.kihon.kihon.repository.EstudianteRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class EstudianteService {

    private final EstudianteRepository estudianteRepository;

    public EstudianteService(
            EstudianteRepository estudianteRepository) {

        this.estudianteRepository = estudianteRepository;
    }

    public List<Estudiante> listarEstudiantes() {
        return estudianteRepository.findAll();
    }

    public Estudiante buscarPorId(Long id) {

        return estudianteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Estudiante no encontrado"));
    }

    public Estudiante crearEstudiante(
            String nombre,
            String apellido,
            String tipoDocumento,
            String documento,
            String telefono,
            String correo,
            LocalDate fechaNacimiento,
            String direccion,
            String foto) {

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

        if (estudianteRepository
                .findByDocumento(documento)
                .isPresent()) {

            throw new RuntimeException(
                    "El documento ya existe");
        }

        if (estudianteRepository
                .findByCorreo(correo)
                .isPresent()) {

            throw new RuntimeException(
                    "El correo ya existe");
        }

        Estudiante estudiante = new Estudiante();

        estudiante.setNombre(nombre);
        estudiante.setApellido(apellido);
        estudiante.setTipoDocumento(tipoDocumento);
        estudiante.setDocumento(documento);
        estudiante.setTelefono(telefono);
        estudiante.setCorreo(correo);
        estudiante.setFechaNacimiento(fechaNacimiento);
        estudiante.setDireccion(direccion);
        estudiante.setFoto(foto);

        estudiante.setEstado("ACTIVO");

        return estudianteRepository.save(estudiante);
    }

    public Estudiante actualizarEstudiante(
            Long id,
            String nombre,
            String apellido,
            String documento,
            String telefono,
            String correo) {

        Estudiante estudiante = estudianteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Estudiante no encontrado"));

        if (!estudiante.getDocumento().equals(documento)
                && estudianteRepository
                        .findByDocumento(documento)
                        .isPresent()) {

            throw new RuntimeException(
                    "El documento ya existe");
        }

        if (!estudiante.getCorreo().equals(correo)
                && estudianteRepository
                        .findByCorreo(correo)
                        .isPresent()) {

            throw new RuntimeException(
                    "El correo ya existe");
        }

        estudiante.setNombre(nombre);
        estudiante.setApellido(apellido);
        estudiante.setDocumento(documento);
        estudiante.setTelefono(telefono);
        estudiante.setCorreo(correo);

        return estudianteRepository.save(estudiante);
    }

    public Estudiante cambiarEstado(
            Long id,
            String estado) {

        Estudiante estudiante = estudianteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Estudiante no encontrado"));

        if (!estado.equals("ACTIVO")
                && !estado.equals("INACTIVO")) {

            throw new RuntimeException(
                    "El estado debe ser ACTIVO o INACTIVO");
        }

        estudiante.setEstado(estado);

        return estudianteRepository.save(estudiante);
    }

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