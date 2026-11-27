package com.kihon.kihon.service;

import com.kihon.kihon.model.Grupo;
import com.kihon.kihon.model.GrupoHorario;
import com.kihon.kihon.model.Rol;
import com.kihon.kihon.model.Usuario;

import com.kihon.kihon.repository.GrupoHorarioRepository;
import com.kihon.kihon.repository.GrupoRepository;
import com.kihon.kihon.repository.UsuarioRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.access.AccessDeniedException;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GrupoHorarioServiceTest {

    @Mock
    private GrupoHorarioRepository grupoHorarioRepository;

    @Mock
    private GrupoRepository grupoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private GrupoHorarioService grupoHorarioService;

    private Usuario sensei;
    private Usuario otroSensei;

    @BeforeEach
    void setUp() {

        sensei = crearUsuario(
                1L,
                "sensei1",
                "SENSEI",
                "ACTIVO");

        otroSensei = crearUsuario(
                2L,
                "sensei2",
                "SENSEI",
                "ACTIVO");
    }

    // ==========================================
    // LISTAR POR SENSEI
    // ==========================================

    @Test
    void listarPorSensei_DebeRetornarSoloGruposActivos() {

        Grupo grupoActivo = crearGrupo(sensei, "ACTIVO");
        Grupo grupoInactivo = crearGrupo(sensei, "INACTIVO");

        GrupoHorario horarioActivo = crearHorario(
                grupoActivo,
                "LUNES");

        GrupoHorario horarioInactivo = crearHorario(
                grupoInactivo,
                "MARTES");

        when(usuarioRepository.findByUsername("sensei1"))
                .thenReturn(Optional.of(sensei));

        when(grupoHorarioRepository.findByGrupo_Sensei_Id(1L))
                .thenReturn(List.of(
                        horarioActivo,
                        horarioInactivo));

        List<GrupoHorario> resultado = grupoHorarioService.listarPorSensei("sensei1");

        assertEquals(1, resultado.size());
        assertSame(horarioActivo, resultado.get(0));

        verify(grupoHorarioRepository)
                .findByGrupo_Sensei_Id(1L);
    }

    // ==========================================
    // LISTAR POR DÍA
    // ==========================================

    @Test
    void listarPorDiaDeSensei_DebeRetornarSoloSusHorariosActivos() {

        Grupo grupoActivo = crearGrupo(sensei, "ACTIVO");
        Grupo grupoInactivo = crearGrupo(sensei, "INACTIVO");

        GrupoHorario horarioActivo = crearHorario(
                grupoActivo,
                "LUNES");

        GrupoHorario horarioInactivo = crearHorario(
                grupoInactivo,
                "LUNES");

        when(usuarioRepository.findByUsername("sensei1"))
                .thenReturn(Optional.of(sensei));

        when(grupoHorarioRepository
                .findByDiaSemanaAndGrupo_Sensei_Id("LUNES", 1L))
                .thenReturn(List.of(
                        horarioActivo,
                        horarioInactivo));

        List<GrupoHorario> resultado = grupoHorarioService.listarPorDiaDeSensei(
                "lunes",
                "sensei1");

        assertEquals(1, resultado.size());
        assertSame(horarioActivo, resultado.get(0));

        verify(grupoHorarioRepository)
                .findByDiaSemanaAndGrupo_Sensei_Id("LUNES", 1L);
    }

    // ==========================================
    // LISTAR POR GRUPO PROPIO
    // ==========================================

    @Test
    void listarPorGrupoDeSensei_DebeRetornarHorariosDelGrupoPropio() {

        Grupo grupo = crearGrupo(sensei, "ACTIVO");

        GrupoHorario horario = crearHorario(
                grupo,
                "MIERCOLES");

        when(usuarioRepository.findByUsername("sensei1"))
                .thenReturn(Optional.of(sensei));

        when(grupoRepository.findById(10L))
                .thenReturn(Optional.of(grupo));

        when(grupoHorarioRepository.findByGrupoId(10L))
                .thenReturn(List.of(horario));

        List<GrupoHorario> resultado = grupoHorarioService.listarPorGrupoDeSensei(
                10L,
                "sensei1");

        assertEquals(1, resultado.size());
        assertSame(horario, resultado.get(0));
    }

    // ==========================================
    // GRUPO INACTIVO
    // ==========================================

    @Test
    void listarPorGrupoDeSensei_GrupoInactivoDebeRetornarListaVacia() {

        Grupo grupo = crearGrupo(sensei, "INACTIVO");

        when(usuarioRepository.findByUsername("sensei1"))
                .thenReturn(Optional.of(sensei));

        when(grupoRepository.findById(10L))
                .thenReturn(Optional.of(grupo));

        List<GrupoHorario> resultado = grupoHorarioService.listarPorGrupoDeSensei(
                10L,
                "sensei1");

        assertTrue(resultado.isEmpty());

        verify(grupoHorarioRepository, never())
                .findByGrupoId(anyLong());
    }

    // ==========================================
    // GRUPO DE OTRO SENSEI
    // ==========================================

    @Test
    void listarPorGrupoDeSensei_NoDebePermitirGrupoAjeno() {

        Grupo grupoAjeno = crearGrupo(otroSensei, "ACTIVO");

        when(usuarioRepository.findByUsername("sensei1"))
                .thenReturn(Optional.of(sensei));

        when(grupoRepository.findById(20L))
                .thenReturn(Optional.of(grupoAjeno));

        assertThrows(
                AccessDeniedException.class,
                () -> grupoHorarioService.listarPorGrupoDeSensei(
                        20L,
                        "sensei1"));

        verify(grupoHorarioRepository, never())
                .findByGrupoId(anyLong());
    }

    // ==========================================
    // BUSCAR POR ID PROPIO
    // ==========================================

    @Test
    void buscarPorIdDeSensei_DebePermitirHorarioPropio() {

        Grupo grupo = crearGrupo(sensei, "ACTIVO");

        GrupoHorario horario = crearHorario(
                grupo,
                "JUEVES");

        when(usuarioRepository.findByUsername("sensei1"))
                .thenReturn(Optional.of(sensei));

        when(grupoHorarioRepository.findById(100L))
                .thenReturn(Optional.of(horario));

        GrupoHorario resultado = grupoHorarioService.buscarPorIdDeSensei(
                100L,
                "sensei1");

        assertSame(horario, resultado);
    }

    // ==========================================
    // BUSCAR POR ID AJENO
    // ==========================================

    @Test
    void buscarPorIdDeSensei_NoDebePermitirHorarioAjeno() {

        Grupo grupoAjeno = crearGrupo(otroSensei, "ACTIVO");

        GrupoHorario horarioAjeno = crearHorario(
                grupoAjeno,
                "VIERNES");

        when(grupoHorarioRepository.findById(200L))
                .thenReturn(Optional.of(horarioAjeno));

        when(usuarioRepository.findByUsername("sensei1"))
                .thenReturn(Optional.of(sensei));

        assertThrows(
                AccessDeniedException.class,
                () -> grupoHorarioService.buscarPorIdDeSensei(
                        200L,
                        "sensei1"));
    }

    // ==========================================
    // VALIDAR ROL
    // ==========================================

    @Test
    void listarPorSensei_UsuarioSinRolSenseiDebeSerRechazado() {

        Usuario administrador = crearUsuario(
                3L,
                "admin",
                "ADMIN",
                "ACTIVO");

        when(usuarioRepository.findByUsername("admin"))
                .thenReturn(Optional.of(administrador));

        assertThrows(
                AccessDeniedException.class,
                () -> grupoHorarioService.listarPorSensei("admin"));

        verify(grupoHorarioRepository, never())
                .findByGrupo_Sensei_Id(anyLong());
    }

    // ==========================================
    // VALIDAR ESTADO DEL SENSEI
    // ==========================================

    @Test
    void listarPorSensei_SenseiInactivoDebeSerRechazado() {

        Usuario senseiInactivo = crearUsuario(
                4L,
                "senseiInactivo",
                "SENSEI",
                "INACTIVO");

        when(usuarioRepository.findByUsername("senseiInactivo"))
                .thenReturn(Optional.of(senseiInactivo));

        assertThrows(
                AccessDeniedException.class,
                () -> grupoHorarioService.listarPorSensei(
                        "senseiInactivo"));

        verify(grupoHorarioRepository, never())
                .findByGrupo_Sensei_Id(anyLong());
    }

    // ==========================================
    // USUARIO NO ENCONTRADO
    // ==========================================

    @Test
    void listarPorSensei_UsuarioInexistenteDebeLanzarExcepcion() {

        when(usuarioRepository.findByUsername("inexistente"))
                .thenReturn(Optional.empty());

        assertThrows(
                RuntimeException.class,
                () -> grupoHorarioService.listarPorSensei(
                        "inexistente"));

        verify(grupoHorarioRepository, never())
                .findByGrupo_Sensei_Id(anyLong());
    }

    // ==========================================
    // MÉTODOS AUXILIARES
    // ==========================================

    private Usuario crearUsuario(
            Long id,
            String username,
            String nombreRol,
            String estado) {

        Usuario usuario = new Usuario();

        usuario.setId(id);
        usuario.setUsername(username);
        usuario.setPassword("password");
        usuario.setEstado(estado);
        usuario.setRol(new Rol(nombreRol));

        return usuario;
    }

    private Grupo crearGrupo(
            Usuario sensei,
            String estado) {

        Grupo grupo = new Grupo();

        grupo.setNombre("Grupo de prueba");
        grupo.setDescripcion("Grupo para pruebas unitarias");
        grupo.setCapacidad(20);
        grupo.setSensei(sensei);
        grupo.setEstado(estado);

        return grupo;
    }

    private GrupoHorario crearHorario(
            Grupo grupo,
            String diaSemana) {

        GrupoHorario horario = new GrupoHorario();

        horario.setGrupo(grupo);
        horario.setDiaSemana(diaSemana);
        horario.setHoraInicio(LocalTime.of(16, 0));
        horario.setHoraFin(LocalTime.of(17, 30));

        return horario;
    }
}
