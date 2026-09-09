package com.kihon.kihon.service;

import com.kihon.kihon.model.Grupo;
import com.kihon.kihon.repository.EstudianteGrupoRepository;
import com.kihon.kihon.repository.GrupoRepository;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;

@Service
public class GrupoService {

    private final GrupoRepository grupoRepository;
    private final EstudianteGrupoRepository estudianteGrupoRepository;

    public GrupoService(
            GrupoRepository grupoRepository,
            EstudianteGrupoRepository estudianteGrupoRepository) {

        this.grupoRepository = grupoRepository;
        this.estudianteGrupoRepository = estudianteGrupoRepository;
    }

    public List<Grupo> listarGrupos() {
        return grupoRepository.findAll();
    }

    public List<Grupo> listarPorEstado(String estado) {

        if (!estado.equals("ACTIVO") && !estado.equals("INACTIVO")) {
            throw new RuntimeException(
                    "El estado debe ser ACTIVO o INACTIVO");
        }

        return grupoRepository.findByEstado(estado);
    }

    public Grupo buscarPorId(Long id) {
        return grupoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Grupo no encontrado"));
    }

    public Grupo crearGrupo(
            String nombre,
            String descripcion,
            LocalTime horaInicio,
            LocalTime horaFin,
            Integer capacidad) {

        if (grupoRepository.findByNombre(nombre).isPresent()) {
            throw new RuntimeException(
                    "El nombre del grupo ya existe");
        }

        if (capacidad == null || capacidad <= 0) {
            throw new RuntimeException(
                    "La capacidad debe ser mayor que 0");
        }

        if (horaInicio == null || horaFin == null) {
            throw new RuntimeException(
                    "La hora de inicio y la hora de fin son obligatorias");
        }

        if (!horaInicio.isBefore(horaFin)) {
            throw new RuntimeException(
                    "La hora de inicio debe ser anterior a la hora de fin");
        }

        Grupo grupo = new Grupo();

        grupo.setNombre(nombre);
        grupo.setDescripcion(descripcion);
        grupo.setHoraInicio(horaInicio);
        grupo.setHoraFin(horaFin);
        grupo.setCapacidad(capacidad);
        grupo.setEstado("ACTIVO");

        return grupoRepository.save(grupo);
    }

    public Grupo actualizarGrupo(
            Long id,
            String nombre,
            String descripcion,
            LocalTime horaInicio,
            LocalTime horaFin,
            Integer capacidad) {

        Grupo grupo = grupoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Grupo no encontrado"));

        if (!grupo.getNombre().equals(nombre)
                && grupoRepository.findByNombre(nombre).isPresent()) {

            throw new RuntimeException(
                    "El nombre del grupo ya existe");
        }

        if (capacidad == null || capacidad <= 0) {
            throw new RuntimeException(
                    "La capacidad debe ser mayor que 0");
        }

        long estudiantesActivos = estudianteGrupoRepository
                .countByGrupoIdAndEstado(id, "ACTIVO");

        if (capacidad < estudiantesActivos) {
            throw new RuntimeException(
                    "La capacidad no puede ser menor que la cantidad de estudiantes activos");
        }

        if (horaInicio == null || horaFin == null) {
            throw new RuntimeException(
                    "La hora de inicio y la hora de fin son obligatorias");
        }

        if (!horaInicio.isBefore(horaFin)) {
            throw new RuntimeException(
                    "La hora de inicio debe ser anterior a la hora de fin");
        }

        grupo.setNombre(nombre);
        grupo.setDescripcion(descripcion);
        grupo.setHoraInicio(horaInicio);
        grupo.setHoraFin(horaFin);
        grupo.setCapacidad(capacidad);

        return grupoRepository.save(grupo);
    }

    public Grupo cambiarEstado(
            Long id,
            String estado) {

        Grupo grupo = grupoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Grupo no encontrado"));

        if (!estado.equals("ACTIVO")
                && !estado.equals("INACTIVO")) {

            throw new RuntimeException(
                    "El estado debe ser ACTIVO o INACTIVO");
        }

        grupo.setEstado(estado);

        return grupoRepository.save(grupo);
    }

    public long contarEstudiantesActivos(Long grupoId) {

        return estudianteGrupoRepository.countByGrupoIdAndEstado(
                grupoId,
                "ACTIVO");
    }
}