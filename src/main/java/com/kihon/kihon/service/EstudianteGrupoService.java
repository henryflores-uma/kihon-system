package com.kihon.kihon.service;

import com.kihon.kihon.model.Estudiante;
import com.kihon.kihon.model.EstudianteGrupo;
import com.kihon.kihon.model.Grupo;
import com.kihon.kihon.repository.EstudianteGrupoRepository;
import com.kihon.kihon.repository.EstudianteRepository;
import com.kihon.kihon.repository.GrupoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EstudianteGrupoService {

        private final EstudianteGrupoRepository estudianteGrupoRepository;
        private final EstudianteRepository estudianteRepository;
        private final GrupoRepository grupoRepository;

        public EstudianteGrupoService(
                        EstudianteGrupoRepository estudianteGrupoRepository,
                        EstudianteRepository estudianteRepository,
                        GrupoRepository grupoRepository) {

                this.estudianteGrupoRepository = estudianteGrupoRepository;
                this.estudianteRepository = estudianteRepository;
                this.grupoRepository = grupoRepository;
        }

        public EstudianteGrupo asignarEstudianteAGrupo(
                        Long estudianteId,
                        Long grupoId) {

                Estudiante estudiante = estudianteRepository.findById(estudianteId)
                                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));

                Grupo grupo = grupoRepository.findById(grupoId)
                                .orElseThrow(() -> new RuntimeException("Grupo no encontrado"));

                if (!grupo.getEstado().equals("ACTIVO")) {
                        throw new RuntimeException(
                                        "No se puede asignar un estudiante a un grupo inactivo");
                }

                if (estudianteGrupoRepository
                                .existsByEstudianteIdAndGrupoIdAndEstado(
                                                estudianteId,
                                                grupoId,
                                                "ACTIVO")) {

                        throw new RuntimeException(
                                        "El estudiante ya está activo en este grupo");
                }

                long estudiantesActivos = estudianteGrupoRepository
                                .countByGrupoIdAndEstado(
                                                grupoId,
                                                "ACTIVO");

                if (estudiantesActivos >= grupo.getCapacidad()) {
                        throw new RuntimeException(
                                        "El grupo ha alcanzado su capacidad máxima");
                }

                EstudianteGrupo estudianteGrupo = new EstudianteGrupo();

                estudianteGrupo.setEstudiante(estudiante);
                estudianteGrupo.setGrupo(grupo);
                estudianteGrupo.setEstado("ACTIVO");

                return estudianteGrupoRepository.save(estudianteGrupo);
        }

        public List<EstudianteGrupo> listarPorEstudiante(
                        Long estudianteId) {

                return estudianteGrupoRepository
                                .findByEstudianteId(estudianteId);
        }

        public List<EstudianteGrupo> listarPorGrupo(
                        Long grupoId) {

                return estudianteGrupoRepository
                                .findByGrupoId(grupoId);
        }

        public EstudianteGrupo cambiarGrupo(
                        Long estudianteId,
                        Long nuevoGrupoId) {

                Estudiante estudiante = estudianteRepository.findById(estudianteId)
                                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));

                Grupo nuevoGrupo = grupoRepository.findById(nuevoGrupoId)
                                .orElseThrow(() -> new RuntimeException("Grupo no encontrado"));

                List<EstudianteGrupo> asignacionesActivas = estudianteGrupoRepository
                                .findByEstudianteIdAndEstado(
                                                estudianteId,
                                                "ACTIVO");

                boolean yaEstaEnNuevoGrupo = asignacionesActivas
                                .stream()
                                .anyMatch(asignacion -> asignacion.getGrupo().getId()
                                                .equals(nuevoGrupoId));

                if (yaEstaEnNuevoGrupo) {
                        throw new RuntimeException(
                                        "El estudiante ya está activo en este grupo");
                }

                long estudiantesActivos = estudianteGrupoRepository
                                .countByGrupoIdAndEstado(
                                                nuevoGrupoId,
                                                "ACTIVO");

                if (estudiantesActivos >= nuevoGrupo.getCapacidad()) {
                        throw new RuntimeException(
                                        "El nuevo grupo ha alcanzado su capacidad máxima");
                }

                for (EstudianteGrupo asignacion : asignacionesActivas) {
                        asignacion.setEstado("INACTIVO");
                        estudianteGrupoRepository.save(asignacion);
                }

                EstudianteGrupo nuevaAsignacion = new EstudianteGrupo();

                nuevaAsignacion.setEstudiante(estudiante);
                nuevaAsignacion.setGrupo(nuevoGrupo);
                nuevaAsignacion.setEstado("ACTIVO");

                return estudianteGrupoRepository.save(nuevaAsignacion);
        }
}