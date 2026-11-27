
package com.kihon.kihon.service;

import com.kihon.kihon.model.Grupo;
import com.kihon.kihon.model.GrupoHorario;
import com.kihon.kihon.model.Usuario;

import com.kihon.kihon.repository.GrupoHorarioRepository;
import com.kihon.kihon.repository.GrupoRepository;
import com.kihon.kihon.repository.UsuarioRepository;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;
import java.util.Locale;

@Service
public class GrupoHorarioService {

        private final GrupoHorarioRepository grupoHorarioRepository;
        private final GrupoRepository grupoRepository;
        private final UsuarioRepository usuarioRepository;

        public GrupoHorarioService(
                        GrupoHorarioRepository grupoHorarioRepository,
                        GrupoRepository grupoRepository,
                        UsuarioRepository usuarioRepository) {

                this.grupoHorarioRepository = grupoHorarioRepository;
                this.grupoRepository = grupoRepository;
                this.usuarioRepository = usuarioRepository;
        }

        // ==========================================
        // LISTAR TODOS
        // ==========================================

        public List<GrupoHorario> listarHorarios() {

                return grupoHorarioRepository.findAll();
        }

        // ==========================================
        // LISTAR POR SENSEI
        // ==========================================

        public List<GrupoHorario> listarPorSensei(String username) {

                Usuario sensei = obtenerSenseiAutenticado(username);

                return grupoHorarioRepository
                                .findByGrupo_Sensei_Id(sensei.getId())
                                .stream()
                                .filter(horario -> horario.getGrupo() != null
                                                && "ACTIVO".equalsIgnoreCase(
                                                                horario.getGrupo().getEstado()))
                                .toList();
        }

        // ==========================================
        // LISTAR POR GRUPO
        // ==========================================

        public List<GrupoHorario> listarPorGrupo(Long grupoId) {

                if (!grupoRepository.existsById(grupoId)) {

                        throw new RuntimeException("Grupo no encontrado");
                }

                return grupoHorarioRepository.findByGrupoId(grupoId);
        }

        // ==========================================
        // LISTAR POR GRUPO - SENSEI
        // ==========================================

        public List<GrupoHorario> listarPorGrupoDeSensei(
                        Long grupoId,
                        String username) {

                Grupo grupo = obtenerGrupoDeSensei(grupoId, username);

                if (!"ACTIVO".equalsIgnoreCase(grupo.getEstado())) {
                        return List.of();
                }

                return grupoHorarioRepository.findByGrupoId(grupoId);
        }

        // ==========================================
        // LISTAR POR DÍA
        // ==========================================

        public List<GrupoHorario> listarPorDia(String diaSemana) {

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
        // LISTAR POR DÍA - SENSEI
        // ==========================================

        public List<GrupoHorario> listarPorDiaDeSensei(
                        String diaSemana,
                        String username) {

                validarDiaSemana(diaSemana);

                Usuario sensei = obtenerSenseiAutenticado(username);

                return grupoHorarioRepository
                                .findByDiaSemanaAndGrupo_Sensei_Id(
                                                diaSemana.toUpperCase(Locale.ROOT),
                                                sensei.getId())
                                .stream()
                                .filter(horario -> horario.getGrupo() != null
                                                && "ACTIVO".equalsIgnoreCase(
                                                                horario.getGrupo().getEstado()))
                                .toList();
        }

        // ==========================================
        // BUSCAR POR ID
        // ==========================================

        public GrupoHorario buscarPorId(Long id) {

                return grupoHorarioRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException(
                                                "Horario no encontrado"));
        }

        // ==========================================
        // BUSCAR POR ID - SENSEI
        // ==========================================

        public GrupoHorario buscarPorIdDeSensei(
                        Long id,
                        String username) {

                GrupoHorario horario = buscarPorId(id);

                validarAccesoGrupo(
                                horario.getGrupo(),
                                username);

                return horario;
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

                String diaNormalizado = diaSemana.toUpperCase(Locale.ROOT);

                validarHorarioDuplicado(
                                grupoId,
                                diaNormalizado,
                                null);

                GrupoHorario horario = new GrupoHorario();

                horario.setGrupo(grupo);
                horario.setDiaSemana(diaNormalizado);
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

                String diaNormalizado = diaSemana.toUpperCase(Locale.ROOT);

                validarHorarioDuplicado(
                                grupoId,
                                diaNormalizado,
                                id);

                horario.setGrupo(grupo);
                horario.setDiaSemana(diaNormalizado);
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
        // OBTENER SENSEI AUTENTICADO
        // ==========================================

        private Usuario obtenerSenseiAutenticado(String username) {

                Usuario sensei = usuarioRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException(
                                                "Usuario autenticado no encontrado"));

                if (sensei.getRol() == null
                                || !"SENSEI".equalsIgnoreCase(
                                                sensei.getRol().getNombre())) {

                        throw new AccessDeniedException(
                                        "El usuario autenticado no tiene el rol SENSEI");
                }

                if (!"ACTIVO".equalsIgnoreCase(sensei.getEstado())) {

                        throw new AccessDeniedException(
                                        "El Sensei no se encuentra activo");
                }

                return sensei;
        }

        // ==========================================
        // OBTENER GRUPO DEL SENSEI
        // ==========================================

        private Grupo obtenerGrupoDeSensei(
                        Long grupoId,
                        String username) {

                Usuario sensei = obtenerSenseiAutenticado(username);

                Grupo grupo = grupoRepository.findById(grupoId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Grupo no encontrado"));

                validarAccesoGrupo(grupo, sensei);

                return grupo;
        }

        // ==========================================
        // VALIDAR ACCESO AL GRUPO
        // ==========================================

        private void validarAccesoGrupo(
                        Grupo grupo,
                        String username) {

                Usuario sensei = obtenerSenseiAutenticado(username);

                validarAccesoGrupo(grupo, sensei);
        }

        private void validarAccesoGrupo(
                        Grupo grupo,
                        Usuario sensei) {

                if (grupo == null
                                || grupo.getSensei() == null
                                || grupo.getSensei().getId() == null
                                || !grupo.getSensei().getId().equals(sensei.getId())) {

                        throw new AccessDeniedException(
                                        "No tienes acceso a este grupo");
                }
        }

        // ==========================================
        // VALIDAR HORARIO DUPLICADO
        // ==========================================

        private void validarHorarioDuplicado(
                        Long grupoId,
                        String diaSemana,
                        Long horarioIdExcluir) {

                boolean existe = grupoHorarioRepository
                                .findByGrupoId(grupoId)
                                .stream()
                                .anyMatch(horario -> diaSemana.equalsIgnoreCase(
                                                horario.getDiaSemana())
                                                && (horarioIdExcluir == null
                                                                || !horario.getId().equals(
                                                                                horarioIdExcluir)));

                if (existe) {

                        throw new RuntimeException(
                                        "El grupo ya tiene un horario registrado para ese día");
                }
        }

        // ==========================================
        // VALIDAR DÍA
        // ==========================================

        private void validarDiaSemana(String diaSemana) {

                if (diaSemana == null || diaSemana.isBlank()) {

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

                if (horaInicio == null || horaFin == null) {

                        throw new RuntimeException(
                                        "La hora de inicio y la hora de fin son obligatorias");
                }

                if (!horaInicio.isBefore(horaFin)) {

                        throw new RuntimeException(
                                        "La hora de inicio debe ser anterior a la hora de fin");
                }
        }
}
