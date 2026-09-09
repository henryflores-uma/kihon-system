package com.kihon.kihon.service;

import com.kihon.kihon.dto.ReporteAsistenciaResponse;
import com.kihon.kihon.model.Asistencia;
import com.kihon.kihon.model.Estudiante;
import com.kihon.kihon.model.Grupo;
import com.kihon.kihon.repository.AsistenciaRepository;
import com.kihon.kihon.repository.EstudianteRepository;
import com.kihon.kihon.repository.GrupoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReporteAsistenciaServiceTest {

    @Mock
    private AsistenciaRepository asistenciaRepository;

    @Mock
    private EstudianteRepository estudianteRepository;

    @Mock
    private GrupoRepository grupoRepository;

    @InjectMocks
    private ReporteAsistenciaService reporteAsistenciaService;

    @Test
    void debeGenerarReporteDiarioCorrectamente() {

        LocalDate fecha = LocalDate.of(2026, 9, 8);

        Estudiante estudiante = mock(Estudiante.class);
        Grupo grupo = mock(Grupo.class);

        when(estudiante.getId()).thenReturn(1L);
        when(estudiante.getNombre()).thenReturn("Juan");
        when(estudiante.getApellido()).thenReturn("Perez");

        when(grupo.getId()).thenReturn(2L);
        when(grupo.getNombre()).thenReturn("Adultos Avanzados 2");

        Asistencia presente = mock(Asistencia.class);
        Asistencia tardanza = mock(Asistencia.class);
        Asistencia ausente = mock(Asistencia.class);

        when(presente.getEstado()).thenReturn("PRESENTE");
        when(presente.getEstudiante()).thenReturn(estudiante);
        when(presente.getGrupo()).thenReturn(grupo);

        when(tardanza.getEstado()).thenReturn("TARDANZA");
        when(tardanza.getEstudiante()).thenReturn(estudiante);
        when(tardanza.getGrupo()).thenReturn(grupo);

        when(ausente.getEstado()).thenReturn("AUSENTE");
        when(ausente.getEstudiante()).thenReturn(estudiante);
        when(ausente.getGrupo()).thenReturn(grupo);

        when(asistenciaRepository.findByFecha(fecha))
                .thenReturn(List.of(presente, tardanza, ausente));

        ReporteAsistenciaResponse resultado = reporteAsistenciaService.generarReporteDiario(fecha);

        assertEquals(3, resultado.getTotal());
        assertEquals(1, resultado.getPresentes());
        assertEquals(1, resultado.getTardanzas());
        assertEquals(1, resultado.getAusentes());
        assertEquals(66.67, resultado.getPorcentajeAsistencia());

        verify(asistenciaRepository).findByFecha(fecha);
    }

    @Test
    void debeGenerarReporteSemanalCorrectamente() {

        LocalDate inicio = LocalDate.of(2026, 9, 7);
        LocalDate fin = LocalDate.of(2026, 9, 13);

        Estudiante estudiante = mock(Estudiante.class);
        Grupo grupo = mock(Grupo.class);

        when(estudiante.getId()).thenReturn(1L);
        when(estudiante.getNombre()).thenReturn("Juan");
        when(estudiante.getApellido()).thenReturn("Perez");

        when(grupo.getId()).thenReturn(2L);
        when(grupo.getNombre()).thenReturn("Adultos Avanzados 2");

        Asistencia presente = mock(Asistencia.class);
        Asistencia tardanza = mock(Asistencia.class);

        when(presente.getEstado()).thenReturn("PRESENTE");
        when(presente.getEstudiante()).thenReturn(estudiante);
        when(presente.getGrupo()).thenReturn(grupo);

        when(tardanza.getEstado()).thenReturn("TARDANZA");
        when(tardanza.getEstudiante()).thenReturn(estudiante);
        when(tardanza.getGrupo()).thenReturn(grupo);

        when(asistenciaRepository.findByFechaBetween(inicio, fin))
                .thenReturn(List.of(presente, tardanza));

        ReporteAsistenciaResponse resultado = reporteAsistenciaService.generarReporteSemanal(
                inicio,
                fin);

        assertEquals(2, resultado.getTotal());
        assertEquals(1, resultado.getPresentes());
        assertEquals(1, resultado.getTardanzas());
        assertEquals(0, resultado.getAusentes());
        assertEquals(100.0, resultado.getPorcentajeAsistencia());

        verify(asistenciaRepository)
                .findByFechaBetween(inicio, fin);
    }

    @Test
    void noDebeAceptarPeriodoInvalido() {

        LocalDate inicio = LocalDate.of(2026, 9, 13);
        LocalDate fin = LocalDate.of(2026, 9, 7);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> reporteAsistenciaService.generarReporteSemanal(
                        inicio,
                        fin));

        assertEquals(
                "La fecha de inicio no puede ser posterior a la fecha de fin",
                exception.getMessage());

        verifyNoInteractions(asistenciaRepository);
    }

    @Test
    void noDebeAceptarMesInvalido() {

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> reporteAsistenciaService.generarReporteMensual(
                        2026,
                        13));

        assertEquals(
                "El mes debe estar entre 1 y 12",
                exception.getMessage());

        verifyNoInteractions(asistenciaRepository);
    }

    @Test
    void noDebeGenerarReporteSiEstudianteNoExiste() {

        Long estudianteId = 99L;

        when(estudianteRepository.findById(estudianteId))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> reporteAsistenciaService.generarReportePorEstudiante(
                        estudianteId));

        assertEquals(
                "Estudiante no encontrado",
                exception.getMessage());

        verify(estudianteRepository).findById(estudianteId);
        verifyNoInteractions(asistenciaRepository);
    }

    @Test
    void noDebeGenerarReporteSiGrupoNoExiste() {

        Long grupoId = 99L;

        when(grupoRepository.findById(grupoId))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> reporteAsistenciaService.generarReportePorGrupo(
                        grupoId));

        assertEquals(
                "Grupo no encontrado",
                exception.getMessage());

        verify(grupoRepository).findById(grupoId);
        verifyNoInteractions(asistenciaRepository);
    }
}