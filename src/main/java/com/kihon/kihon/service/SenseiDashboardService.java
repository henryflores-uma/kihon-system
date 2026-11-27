
package com.kihon.kihon.service;

import com.kihon.kihon.dto.SenseiDashboardResponse;
import com.kihon.kihon.dto.SenseiDashboardResponse.ClaseHoyResponse;
import com.kihon.kihon.dto.SenseiDashboardResponse.GrupoResumenResponse;

import com.kihon.kihon.model.Asistencia;
import com.kihon.kihon.model.Estudiante;
import com.kihon.kihon.model.EstudianteGrupo;
import com.kihon.kihon.model.Grupo;
import com.kihon.kihon.model.GrupoHorario;
import com.kihon.kihon.model.Usuario;

import com.kihon.kihon.repository.AsistenciaRepository;
import com.kihon.kihon.repository.EstudianteGrupoRepository;
import com.kihon.kihon.repository.GrupoHorarioRepository;
import com.kihon.kihon.repository.GrupoRepository;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneId;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class SenseiDashboardService {

    private static final ZoneId ZONA_HORARIA = ZoneId.of("America/Lima");

    private final UsuarioService usuarioService;
    private final GrupoRepository grupoRepository;
    private final EstudianteGrupoRepository estudianteGrupoRepository;
    private final GrupoHorarioRepository grupoHorarioRepository;
    private final AsistenciaRepository asistenciaRepository;

    public SenseiDashboardService(
            UsuarioService usuarioService,
            GrupoRepository grupoRepository,
            EstudianteGrupoRepository estudianteGrupoRepository,
            GrupoHorarioRepository grupoHorarioRepository,
            AsistenciaRepository asistenciaRepository) {

        this.usuarioService = usuarioService;
        this.grupoRepository = grupoRepository;
        this.estudianteGrupoRepository = estudianteGrupoRepository;
        this.grupoHorarioRepository = grupoHorarioRepository;
        this.asistenciaRepository = asistenciaRepository;
    }

    /*
     * =========================================================
     * DASHBOARD DEL SENSEI
     * =========================================================
     */

    @Transactional(readOnly = true)
    public SenseiDashboardResponse obtenerDashboard(String username) {

        // -----------------------------------------------------
        // 1. OBTENER USUARIO AUTENTICADO
        // -----------------------------------------------------

        Usuario usuario = usuarioService.buscarPorUsername(username);

        if (usuario.getRol() == null
                || !"SENSEI".equalsIgnoreCase(
                        usuario.getRol().getNombre())) {

            throw new AccessDeniedException(
                    "No tienes permisos para consultar el dashboard del Sensei");
        }

        if (!"ACTIVO".equalsIgnoreCase(usuario.getEstado())) {

            throw new AccessDeniedException(
                    "La cuenta del Sensei no se encuentra activa");
        }

        // -----------------------------------------------------
        // 2. FECHA Y DÍA ACTUAL
        // -----------------------------------------------------

        LocalDate fechaHoy = LocalDate.now(ZONA_HORARIA);

        String diaHoy = obtenerDiaSemana(fechaHoy.getDayOfWeek());

        // -----------------------------------------------------
        // 3. OBTENER GRUPOS ASIGNADOS AL SENSEI
        // -----------------------------------------------------

        List<Grupo> gruposEncontrados = grupoRepository
                .findBySenseiId(usuario.getId());

        List<Grupo> gruposAsignados = gruposEncontrados.stream()
                .filter(grupo -> grupo != null
                        && "ACTIVO".equalsIgnoreCase(grupo.getEstado()))
                .sorted(Comparator.comparing(
                        grupo -> grupo.getNombre(),
                        Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)))
                .toList();

        // -----------------------------------------------------
        // 4. PREPARAR CONTADORES Y LISTAS
        // -----------------------------------------------------

        Set<Long> estudiantesUnicos = new LinkedHashSet<>();

        List<GrupoResumenResponse> gruposResponse = new ArrayList<>();

        List<ClaseHoyResponse> clasesHoy = new ArrayList<>();

        int totalAsistencias = 0;
        int presentes = 0;
        int ausentes = 0;
        int tardanzas = 0;
        int justificados = 0;

        // -----------------------------------------------------
        // 5. PROCESAR CADA GRUPO
        // -----------------------------------------------------

        for (Grupo grupo : gruposAsignados) {

            // ---------------------------------------------
            // ESTUDIANTES ACTIVOS DEL GRUPO
            // ---------------------------------------------

            List<EstudianteGrupo> inscripciones = estudianteGrupoRepository.findByGrupoId(
                    grupo.getId());

            Set<Long> estudiantesDelGrupo = new HashSet<>();

            for (EstudianteGrupo inscripcion : inscripciones) {

                if (inscripcion == null
                        || inscripcion.getEstudiante() == null) {

                    continue;
                }

                if (!"ACTIVO".equalsIgnoreCase(
                        inscripcion.getEstado())) {

                    continue;
                }

                Estudiante estudiante = inscripcion.getEstudiante();

                if (estudiante.getId() == null
                        || !"ACTIVO".equalsIgnoreCase(
                                estudiante.getEstado())) {

                    continue;
                }

                estudiantesDelGrupo.add(estudiante.getId());

                // Evitar contar dos veces al mismo estudiante
                // si pertenece a más de un grupo del Sensei.
                estudiantesUnicos.add(estudiante.getId());
            }

            int cantidadEstudiantes = estudiantesDelGrupo.size();

            gruposResponse.add(
                    new GrupoResumenResponse(
                            grupo.getId(),
                            grupo.getNombre(),
                            cantidadEstudiantes));

            // ---------------------------------------------
            // ASISTENCIAS DEL GRUPO EN LA FECHA ACTUAL
            // ---------------------------------------------

            List<Asistencia> asistencias = asistenciaRepository.findByGrupoIdAndFecha(
                    grupo.getId(),
                    fechaHoy);

            int asistenciasDelGrupo = asistencias.size();

            totalAsistencias += asistenciasDelGrupo;

            for (Asistencia asistencia : asistencias) {

                String estado = asistencia.getEstado() == null
                        ? ""
                        : asistencia.getEstado()
                                .trim()
                                .toUpperCase(Locale.ROOT);

                switch (estado) {

                    case "PRESENTE" ->
                        presentes++;

                    case "AUSENTE" ->
                        ausentes++;

                    case "TARDANZA" ->
                        tardanzas++;

                    case "JUSTIFICADO" ->
                        justificados++;

                    default -> {
                        // Se contabiliza en el total de asistencias,
                        // pero no en los estados conocidos.
                    }
                }
            }

            // ---------------------------------------------
            // HORARIOS DEL GRUPO PARA HOY
            // ---------------------------------------------

            List<GrupoHorario> horarios = grupoHorarioRepository.findByGrupoId(
                    grupo.getId());

            for (GrupoHorario horario : horarios) {

                if (!diaHoy.equalsIgnoreCase(
                        horario.getDiaSemana())) {

                    continue;
                }

                clasesHoy.add(
                        new ClaseHoyResponse(
                                horario.getId(),
                                grupo.getId(),
                                grupo.getNombre(),
                                horario.getHoraInicio(),
                                horario.getHoraFin(),
                                cantidadEstudiantes,
                                asistenciasDelGrupo));
            }
        }

        // -----------------------------------------------------
        // 6. ORDENAR CLASES POR HORA DE INICIO
        // -----------------------------------------------------

        clasesHoy.sort(
                Comparator.comparing(
                        clase -> clase.horaInicio(),
                        Comparator.nullsLast(Comparator.naturalOrder())));

        // -----------------------------------------------------
        // 7. CONSTRUIR RESPUESTA
        // -----------------------------------------------------

        return new SenseiDashboardResponse(

                fechaHoy,

                gruposAsignados.size(),

                estudiantesUnicos.size(),

                clasesHoy.size(),

                totalAsistencias,

                presentes,

                ausentes,

                tardanzas,

                justificados,

                gruposResponse,

                clasesHoy);
    }

    /*
     * =========================================================
     * CONVERTIR DÍA DE LA SEMANA
     * =========================================================
     */

    private String obtenerDiaSemana(DayOfWeek dia) {

        return switch (dia) {

            case MONDAY -> "LUNES";

            case TUESDAY -> "MARTES";

            case WEDNESDAY -> "MIERCOLES";

            case THURSDAY -> "JUEVES";

            case FRIDAY -> "VIERNES";

            case SATURDAY -> "SABADO";

            case SUNDAY -> "DOMINGO";
        };
    }
}
