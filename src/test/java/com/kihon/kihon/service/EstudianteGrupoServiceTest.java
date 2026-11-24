
package com.kihon.kihon.service;

import com.kihon.kihon.model.Estudiante;
import com.kihon.kihon.model.EstudianteGrupo;
import com.kihon.kihon.model.Grupo;
import com.kihon.kihon.repository.EstudianteGrupoRepository;
import com.kihon.kihon.repository.EstudianteRepository;
import com.kihon.kihon.repository.GrupoRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EstudianteGrupoServiceTest {

        @Mock
        private EstudianteGrupoRepository estudianteGrupoRepository;

        @Mock
        private EstudianteRepository estudianteRepository;

        @Mock
        private GrupoRepository grupoRepository;

        @InjectMocks
        private EstudianteGrupoService estudianteGrupoService;

        private Estudiante estudiante;
        private Grupo grupo;

        @BeforeEach
        void setUp() {

                estudiante = new Estudiante();
                estudiante.setId(1L);
                estudiante.setEstado("ACTIVO");

                grupo = mock(Grupo.class);
        }

        // ==========================================
        // ESTUDIANTE INEXISTENTE
        // ==========================================

        @Test
        void noDebeAsignarSiEstudianteNoExiste() {

                when(estudianteRepository.findById(1L))
                                .thenReturn(Optional.empty());

                RuntimeException exception = assertThrows(
                                RuntimeException.class,
                                () -> estudianteGrupoService
                                                .asignarEstudianteAGrupo(1L, 1L));

                assertEquals(
                                "No se encontró el estudiante",
                                exception.getMessage());

                verify(grupoRepository, never()).findById(anyLong());

                verify(estudianteGrupoRepository, never()).save(any());
        }

        // ==========================================
        // ESTUDIANTE INACTIVO
        // ==========================================

        @Test
        void noDebeAsignarSiEstudianteEstaInactivo() {

                estudiante.setEstado("INACTIVO");

                when(estudianteRepository.findById(1L))
                                .thenReturn(Optional.of(estudiante));

                when(grupoRepository.findById(1L))
                                .thenReturn(Optional.of(grupo));

                RuntimeException exception = assertThrows(
                                RuntimeException.class,
                                () -> estudianteGrupoService
                                                .asignarEstudianteAGrupo(1L, 1L));

                assertEquals(
                                "El estudiante no se encuentra activo",
                                exception.getMessage());

                verify(estudianteGrupoRepository, never()).save(any());
        }

        // ==========================================
        // GRUPO INACTIVO
        // ==========================================

        @Test
        void noDebeAsignarSiGrupoEstaInactivo() {

                when(grupo.getEstado()).thenReturn("INACTIVO");

                when(estudianteRepository.findById(1L))
                                .thenReturn(Optional.of(estudiante));

                when(grupoRepository.findById(1L))
                                .thenReturn(Optional.of(grupo));

                RuntimeException exception = assertThrows(
                                RuntimeException.class,
                                () -> estudianteGrupoService
                                                .asignarEstudianteAGrupo(1L, 1L));

                assertEquals(
                                "El grupo no se encuentra activo",
                                exception.getMessage());

                verify(estudianteGrupoRepository, never()).save(any());
        }

        // ==========================================
        // ASIGNACIÓN DUPLICADA
        // ==========================================

        @Test
        void noDebePermitirAsignacionDuplicada() {

                when(grupo.getEstado()).thenReturn("ACTIVO");

                when(estudianteRepository.findById(1L))
                                .thenReturn(Optional.of(estudiante));

                when(grupoRepository.findById(1L))
                                .thenReturn(Optional.of(grupo));

                when(estudianteGrupoRepository
                                .existsByEstudianteIdAndGrupoIdAndEstado(
                                                1L,
                                                1L,
                                                "ACTIVO"))
                                .thenReturn(true);

                RuntimeException exception = assertThrows(
                                RuntimeException.class,
                                () -> estudianteGrupoService
                                                .asignarEstudianteAGrupo(1L, 1L));

                assertEquals(
                                "El estudiante ya está activo en este grupo",
                                exception.getMessage());

                verify(estudianteGrupoRepository, never()).save(any());
        }

        // ==========================================
        // CAMBIAR A GRUPO INACTIVO
        // ==========================================

        @Test
        void noDebeCambiarAUnGrupoInactivo() {

                EstudianteGrupo asignacion = new EstudianteGrupo();

                asignacion.setEstudiante(estudiante);
                asignacion.setGrupo(grupo);
                asignacion.setEstado("ACTIVO");

                Grupo nuevoGrupo = mock(Grupo.class);

                when(nuevoGrupo.getEstado()).thenReturn("INACTIVO");

                when(estudianteGrupoRepository.findById(1L))
                                .thenReturn(Optional.of(asignacion));

                when(grupoRepository.findById(2L))
                                .thenReturn(Optional.of(nuevoGrupo));

                RuntimeException exception = assertThrows(
                                RuntimeException.class,
                                () -> estudianteGrupoService
                                                .cambiarGrupo(1L, 2L));

                assertEquals(
                                "El grupo no se encuentra activo",
                                exception.getMessage());

                verify(estudianteGrupoRepository, never()).save(any());
        }
}
