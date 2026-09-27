package com.kihon.kihon.service;

import com.kihon.kihon.model.Grupo;
import com.kihon.kihon.model.GrupoHorario;
import com.kihon.kihon.repository.GrupoHorarioRepository;
import com.kihon.kihon.repository.GrupoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;
import java.util.Locale;

@Service
public class GrupoHorarioService {

        private final GrupoHorarioRepository grupoHorarioRepository;
        private final GrupoRepository grupoRepository;

        public GrupoHorarioService(
                        GrupoHorarioRepository grupoHorarioRepository,
                        GrupoRepository grupoRepository) {

                this.grupoHorarioRepository = grupoHorarioRepository;
                this.grupoRepository = grupoRepository;
        }

        // ==========================================
        // LISTAR TODOS
        // ==========================================

        public List<GrupoHorario> listarHorarios() {

                return grupoHorarioRepository.findAll();
        }

        // ==========================================
        // LISTAR POR GRUPO
        // ==========================================

        public List<GrupoHorario> listarPorGrupo(
                        Long grupoId) {

                if (!grupoRepository.existsById(grupoId)) {

                        throw new RuntimeException(
                                        "Grupo no encontrado");
                }

                return grupoHorarioRepository.findByGrupoId(grupoId);
        }

        // ==========================================
        // LISTAR POR DÍA
        // ==========================================

        public List<GrupoHorario> listarPorDia(
                        String diaSemana) {

                validarDiaSemana(diaSemana);

                return grupoHorarioRepository
                                .findByDiaSemana(
                                                diaSemana.toUpperCase(Locale.ROOT))
                                .stream()
                                .filter(horario -> horario.getGrupo() != null
                                                && "ACTIVO".equalsIgnoreCase(
                                                                horario.getGrupo().getEstado()))
                                .toList();
        }

        // ==========================================
        // BUSCAR POR ID
        // ==========================================

        public GrupoHorario buscarPorId(
                        Long id) {

                return grupoHorarioRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException(
                                                "Horario no encontrado"));
        }

        // ==========================================
        // CREAR
        // ==========================================

        @Transactional
        public GrupoHorario crearHorario(
                        Long grupoId,
                        String diaSemana,
                        LocalTime horaInicio,
                        LocalTime horaFin) {

                validarDiaSemana(diaSemana);
                validarHoras(horaInicio, horaFin);

                Grupo grupo = grupoRepository.findById(grupoId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Grupo no encontrado"));

                if (!"ACTIVO".equalsIgnoreCase(grupo.getEstado())) {

                        throw new RuntimeException(
                                        "No se puede crear un horario para un grupo inactivo");
                }

                GrupoHorario horario = new GrupoHorario();

                horario.setGrupo(grupo);
                horario.setDiaSemana(
                                diaSemana.toUpperCase(Locale.ROOT));
                horario.setHoraInicio(horaInicio);
                horario.setHoraFin(horaFin);

                return grupoHorarioRepository.save(horario);
        }

        // ==========================================
        // ACTUALIZAR
        // ==========================================

        @Transactional
        public GrupoHorario actualizarHorario(
                        Long id,
                        Long grupoId,
                        String diaSemana,
                        LocalTime horaInicio,
                        LocalTime horaFin) {

                validarDiaSemana(diaSemana);
                validarHoras(horaInicio, horaFin);

                GrupoHorario horario = grupoHorarioRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException(
                                                "Horario no encontrado"));

                Grupo grupo = grupoRepository.findById(grupoId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Grupo no encontrado"));

                if (!"ACTIVO".equalsIgnoreCase(grupo.getEstado())) {

                        throw new RuntimeException(
                                        "No se puede asignar un horario a un grupo inactivo");
                }

                horario.setGrupo(grupo);
                horario.setDiaSemana(
                                diaSemana.toUpperCase(Locale.ROOT));
                horario.setHoraInicio(horaInicio);
                horario.setHoraFin(horaFin);

                return grupoHorarioRepository.save(horario);
        }

        // ==========================================
        // ELIMINAR
        // ==========================================

        @Transactional
        public void eliminarHorario(Long id) {

                if (!grupoHorarioRepository.existsById(id)) {

                        throw new RuntimeException(
                                        "Horario no encontrado");
                }

                grupoHorarioRepository.deleteById(id);
        }

        // ==========================================
        // VALIDAR DÍA
        // ==========================================

        private void validarDiaSemana(
                        String diaSemana) {

                if (diaSemana == null
                                || diaSemana.isBlank()) {

                        throw new RuntimeException(
                                        "El día de la semana es obligatorio");
                }

                String dia = diaSemana.toUpperCase(Locale.ROOT);

                if (!dia.equals("LUNES")
                                && !dia.equals("MARTES")
                                && !dia.equals("MIERCOLES")
                                && !dia.equals("JUEVES")
                                && !dia.equals("VIERNES")
                                && !dia.equals("SABADO")
                                && !dia.equals("DOMINGO")) {

                        throw new RuntimeException(
                                        "El día de la semana no es válido");
                }
        }

        // ==========================================
        // VALIDAR HORAS
        // ==========================================

        private void validarHoras(
                        LocalTime horaInicio,
                        LocalTime horaFin) {

                if (horaInicio == null
                                || horaFin == null) {

                        throw new RuntimeException(
                                        "La hora de inicio y la hora de fin son obligatorias");
                }

                if (!horaInicio.isBefore(horaFin)) {

                        throw new RuntimeException(
                                        "La hora de inicio debe ser anterior a la hora de fin");
                }
        }
}