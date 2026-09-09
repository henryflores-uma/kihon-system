package com.kihon.kihon.service;

import com.kihon.kihon.model.Estudiante;
import com.kihon.kihon.model.Grupo;
import com.kihon.kihon.repository.AsistenciaRepository;
import com.kihon.kihon.repository.EstudianteGrupoRepository;
import com.kihon.kihon.repository.EstudianteRepository;
import com.kihon.kihon.repository.GrupoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AsistenciaServiceTest {

    @Mock
    private AsistenciaRepository asistenciaRepository;

    @Mock
    private EstudianteRepository estudianteRepository;

    @Mock
    private GrupoRepository grupoRepository;

    @Mock
    private EstudianteGrupoRepository estudianteGrupoRepository;

    @InjectMocks
    private AsistenciaService asistenciaService;

    private Estudiante estudiante;
    private Grupo grupo;

    @BeforeEach
    void setUp() {
        estudiante = new Estudiante();

        grupo = new Grupo();
        grupo.setEstado("ACTIVO");
    }

    @Test
    void noDebeRegistrarAsistenciaSiEstudianteNoEstaAsignadoAlGrupo() {

        when(estudianteRepository.findById(1L))
                .thenReturn(Optional.of(estudiante));

        when(grupoRepository.findById(2L))
                .thenReturn(Optional.of(grupo));

        when(estudianteGrupoRepository
                .existsByEstudianteIdAndGrupoIdAndEstado(
                        1L,
                        2L,
                        "ACTIVO"))
                .thenReturn(false);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> asistenciaService.registrarAsistencia(
                        1L,
                        2L,
                        LocalDate.of(2026, 9, 7),
                        LocalTime.of(19, 35),
                        "PRESENTE",
                        null));

        assertEquals(
                "El estudiante no está asignado activamente a este grupo",
                exception.getMessage());
    }

    @Test
    void noDebeRegistrarAsistenciaSiGrupoEstaInactivo() {

        grupo.setEstado("INACTIVO");

        when(estudianteRepository.findById(1L))
                .thenReturn(Optional.of(estudiante));

        when(grupoRepository.findById(2L))
                .thenReturn(Optional.of(grupo));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> asistenciaService.registrarAsistencia(
                        1L,
                        2L,
                        LocalDate.of(2026, 9, 7),
                        LocalTime.of(19, 35),
                        "PRESENTE",
                        null));

        assertEquals(
                "No se puede registrar asistencia en un grupo inactivo",
                exception.getMessage());
    }

    @Test
    void noDebeRegistrarAsistenciaDuplicada() {

        when(estudianteRepository.findById(1L))
                .thenReturn(Optional.of(estudiante));

        when(grupoRepository.findById(2L))
                .thenReturn(Optional.of(grupo));

        when(estudianteGrupoRepository
                .existsByEstudianteIdAndGrupoIdAndEstado(
                        1L,
                        2L,
                        "ACTIVO"))
                .thenReturn(true);

        when(asistenciaRepository
                .existsByEstudianteIdAndGrupoIdAndFecha(
                        1L,
                        2L,
                        LocalDate.of(2026, 9, 7)))
                .thenReturn(true);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> asistenciaService.registrarAsistencia(
                        1L,
                        2L,
                        LocalDate.of(2026, 9, 7),
                        LocalTime.of(19, 35),
                        "PRESENTE",
                        null));

        assertEquals(
                "El estudiante ya tiene asistencia registrada para este grupo en esta fecha",
                exception.getMessage());
    }

    @Test
    void presenteRequiereHoraDeLlegada() {

        when(estudianteRepository.findById(1L))
                .thenReturn(Optional.of(estudiante));

        when(grupoRepository.findById(2L))
                .thenReturn(Optional.of(grupo));

        when(estudianteGrupoRepository
                .existsByEstudianteIdAndGrupoIdAndEstado(
                        1L,
                        2L,
                        "ACTIVO"))
                .thenReturn(true);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> asistenciaService.registrarAsistencia(
                        1L,
                        2L,
                        LocalDate.of(2026, 9, 7),
                        null,
                        "PRESENTE",
                        null));

        assertEquals(
                "La hora de llegada es obligatoria para PRESENTE o TARDANZA",
                exception.getMessage());
    }

    @Test
    void ausenteNoDebeTenerHoraDeLlegada() {

        when(estudianteRepository.findById(1L))
                .thenReturn(Optional.of(estudiante));

        when(grupoRepository.findById(2L))
                .thenReturn(Optional.of(grupo));

        when(estudianteGrupoRepository
                .existsByEstudianteIdAndGrupoIdAndEstado(
                        1L,
                        2L,
                        "ACTIVO"))
                .thenReturn(true);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> asistenciaService.registrarAsistencia(
                        1L,
                        2L,
                        LocalDate.of(2026, 9, 7),
                        LocalTime.of(19, 35),
                        "AUSENTE",
                        null));

        assertEquals(
                "Un estudiante AUSENTE no debe tener hora de llegada",
                exception.getMessage());
    }
}