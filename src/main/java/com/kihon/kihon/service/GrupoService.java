package com.kihon.kihon.service;

import com.kihon.kihon.model.FrecuenciaGrupo;
import com.kihon.kihon.model.Grupo;
import com.kihon.kihon.model.Usuario;
import com.kihon.kihon.repository.EstudianteGrupoRepository;
import com.kihon.kihon.repository.FrecuenciaGrupoRepository;
import com.kihon.kihon.repository.GrupoRepository;
import com.kihon.kihon.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class GrupoService {
    private final GrupoRepository grupoRepository;
    private final EstudianteGrupoRepository estudianteGrupoRepository;
    private final UsuarioRepository usuarioRepository;
    private final FrecuenciaGrupoRepository frecuenciaGrupoRepository;

    public GrupoService(GrupoRepository grupoRepository, EstudianteGrupoRepository estudianteGrupoRepository,
            UsuarioRepository usuarioRepository, FrecuenciaGrupoRepository frecuenciaGrupoRepository) {
        this.grupoRepository = grupoRepository;
        this.estudianteGrupoRepository = estudianteGrupoRepository;
        this.usuarioRepository = usuarioRepository;
        this.frecuenciaGrupoRepository = frecuenciaGrupoRepository;
    }

    public List<Grupo> listarGrupos() {
        return grupoRepository.findAll();
    }

    public List<Grupo> listarPorEstado(String estado) {
        if (!estado.equals("ACTIVO") && !estado.equals("INACTIVO")) {
            throw new RuntimeException("El estado debe ser ACTIVO o INACTIVO");
        }
        return grupoRepository.findByEstado(estado);
    }

    public Grupo buscarPorId(Long id) {
        return grupoRepository.findById(id).orElseThrow(() -> new RuntimeException("Grupo no encontrado"));
    }

    public void eliminarGrupo(Long id) {
        if (!grupoRepository.existsById(id)) {
            throw new RuntimeException("Grupo no encontrado");
        }
        grupoRepository.deleteById(id);
    }

    public Grupo crearGrupo(String nombre, String descripcion, Integer capacidad, Long senseiId, Long frecuenciaId) {
        if (grupoRepository.findByNombre(nombre).isPresent()) {
            throw new RuntimeException("El nombre del grupo ya existe");
        }
        if (capacidad == null || capacidad <= 0) {
            throw new RuntimeException("La capacidad debe ser mayor que 0");
        }
        FrecuenciaGrupo frecuencia = obtenerFrecuencia(frecuenciaId);
        Grupo grupo = new Grupo();
        grupo.setNombre(nombre);
        grupo.setDescripcion(descripcion);
        grupo.setCapacidad(capacidad);
        grupo.setFrecuencia(frecuencia);
        grupo.setEstado("ACTIVO");
        if (senseiId != null) {
            Usuario sensei = obtenerSensei(senseiId);
            grupo.setSensei(sensei);
        }
        return grupoRepository.save(grupo);
    }

    public Grupo actualizarGrupo(Long id, String nombre, String descripcion, Integer capacidad, Long senseiId,
            Long frecuenciaId) {
        Grupo grupo = grupoRepository.findById(id).orElseThrow(() -> new RuntimeException("Grupo no encontrado"));
        if (!grupo.getNombre().equals(nombre) && grupoRepository.findByNombre(nombre).isPresent()) {
            throw new RuntimeException("El nombre del grupo ya existe");
        }
        if (capacidad == null || capacidad <= 0) {
            throw new RuntimeException("La capacidad debe ser mayor que 0");
        }
        long estudiantesActivos = estudianteGrupoRepository.countByGrupoIdAndEstado(id, "ACTIVO");
        if (capacidad < estudiantesActivos) {
            throw new RuntimeException("La capacidad no puede ser menor que la cantidad de estudiantes activos");
        }
        FrecuenciaGrupo frecuencia = obtenerFrecuencia(frecuenciaId);
        grupo.setNombre(nombre);
        grupo.setDescripcion(descripcion);
        grupo.setCapacidad(capacidad);
        grupo.setFrecuencia(frecuencia);
        if (senseiId != null) {
            Usuario sensei = obtenerSensei(senseiId);
            grupo.setSensei(sensei);
        } else {
            grupo.setSensei(null);
        }
        return grupoRepository.save(grupo);
    }

    public Grupo cambiarEstado(Long id, String estado) {
        Grupo grupo = grupoRepository.findById(id).orElseThrow(() -> new RuntimeException("Grupo no encontrado"));
        if (!estado.equals("ACTIVO") && !estado.equals("INACTIVO")) {
            throw new RuntimeException("El estado debe ser ACTIVO o INACTIVO");
        }
        grupo.setEstado(estado);
        return grupoRepository.save(grupo);
    }

    public long contarEstudiantesActivos(Long grupoId) {
        return estudianteGrupoRepository.countByGrupoIdAndEstado(grupoId, "ACTIVO");
    }

    private FrecuenciaGrupo obtenerFrecuencia(Long frecuenciaId) {
        if (frecuenciaId == null) {
            throw new RuntimeException("La frecuencia semanal es obligatoria");
        }
        return frecuenciaGrupoRepository.findById(frecuenciaId)
                .orElseThrow(() -> new RuntimeException("Frecuencia de grupo no encontrada"));
    }

    private Usuario obtenerSensei(Long senseiId) {
        Usuario usuario = usuarioRepository.findById(senseiId)
                .orElseThrow(() -> new RuntimeException("Sensei no encontrado"));
        if (usuario.getRol() == null || !"SENSEI".equalsIgnoreCase(usuario.getRol().getNombre())) {
            throw new RuntimeException("El usuario seleccionado no tiene el rol SENSEI");
        }
        if (!"ACTIVO".equalsIgnoreCase(usuario.getEstado())) {
            throw new RuntimeException("El sensei seleccionado no está activo");
        }
        return usuario;
    }
}