package com.kihon.kihon.service;

import com.kihon.kihon.model.Asistencia;
import com.kihon.kihon.model.Estudiante;
import com.kihon.kihon.model.EstudianteGrupo;
import com.kihon.kihon.model.Usuario;
import com.kihon.kihon.repository.EstudianteGrupoRepository;
import com.kihon.kihon.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EstudiantePortalService {

    private final UsuarioRepository usuarioRepository;
    private final AsistenciaService asistenciaService;
    private final EstudianteGrupoRepository estudianteGrupoRepository;

    public EstudiantePortalService(
            UsuarioRepository usuarioRepository,
            AsistenciaService asistenciaService,
            EstudianteGrupoRepository estudianteGrupoRepository) {

        this.usuarioRepository = usuarioRepository;
        this.asistenciaService = asistenciaService;
        this.estudianteGrupoRepository = estudianteGrupoRepository;
    }

    public Estudiante obtenerEstudianteAutenticado(
            String username) {

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException(
                        "Usuario no encontrado"));

        Estudiante estudiante = usuario.getEstudiante();

        if (estudiante == null) {
            throw new RuntimeException(
                    "El usuario no está vinculado a un estudiante");
        }

        return estudiante;
    }

    public List<Asistencia> listarMisAsistencias(
            String username) {

        Estudiante estudiante = obtenerEstudianteAutenticado(username);

        return asistenciaService.listarPorEstudiante(
                estudiante.getId());
    }

    public List<EstudianteGrupo> listarMisGrupos(
            String username) {

        Estudiante estudiante = obtenerEstudianteAutenticado(username);

        return estudianteGrupoRepository
                .findByEstudianteIdAndEstado(
                        estudiante.getId(),
                        "ACTIVO");
    }
}