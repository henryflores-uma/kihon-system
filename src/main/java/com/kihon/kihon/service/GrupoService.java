
package com.kihon.kihon.service;

import com.kihon.kihon.model.FrecuenciaGrupo;
import com.kihon.kihon.model.Grupo;
import com.kihon.kihon.model.Usuario;
import com.kihon.kihon.repository.EstudianteGrupoRepository;
import com.kihon.kihon.repository.FrecuenciaGrupoRepository;
import com.kihon.kihon.repository.GrupoRepository;
import com.kihon.kihon.repository.UsuarioRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class GrupoService {

        private final GrupoRepository grupoRepository;
        private final EstudianteGrupoRepository estudianteGrupoRepository;
        private final UsuarioRepository usuarioRepository;
        private final FrecuenciaGrupoRepository frecuenciaGrupoRepository;

        public GrupoService(
                        GrupoRepository grupoRepository,
                        EstudianteGrupoRepository estudianteGrupoRepository,
                        UsuarioRepository usuarioRepository,
                        FrecuenciaGrupoRepository frecuenciaGrupoRepository) {

                this.grupoRepository = grupoRepository;
                this.estudianteGrupoRepository = estudianteGrupoRepository;
                this.usuarioRepository = usuarioRepository;
                this.frecuenciaGrupoRepository = frecuenciaGrupoRepository;
        }

        /*
         * =============================================================
         * LISTAR TODOS LOS GRUPOS
         * ADMIN / SECRETARIA
         * =============================================================
         */

        public List<Grupo> listarGrupos() {
                return grupoRepository.findAll();
        }

        /*
         * =============================================================
         * LISTAR GRUPOS POR ESTADO
         * ADMIN / SECRETARIA
         * =============================================================
         */

        public List<Grupo> listarPorEstado(String estado) {

                validarEstado(estado);

                return grupoRepository.findByEstado(
                                estado.toUpperCase());
        }

        /*
         * =============================================================
         * LISTAR GRUPOS DEL SENSEI AUTENTICADO
         * =============================================================
         */

        public List<Grupo> listarPorSensei(
                        String username,
                        String estado) {

                Usuario sensei = obtenerSenseiAutenticado(username);

                List<Grupo> grupos = grupoRepository.findBySenseiId(
                                sensei.getId());

                if (estado == null || estado.isBlank()) {
                        return grupos;
                }

                validarEstado(estado);

                return grupos.stream()
                                .filter(grupo -> estado.equalsIgnoreCase(
                                                grupo.getEstado()))
                                .toList();
        }

        /*
         * =============================================================
         * BUSCAR GRUPO POR ID
         * ADMIN / SECRETARIA
         * =============================================================
         */

        public Grupo buscarPorId(Long id) {

                return grupoRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException(
                                                "Grupo no encontrado"));
        }

        /*
         * =============================================================
         * BUSCAR GRUPO DEL SENSEI AUTENTICADO
         * =============================================================
         */

        public Grupo buscarPorIdDeSensei(
                        Long grupoId,
                        String username) {

                Usuario sensei = obtenerSenseiAutenticado(username);

                Grupo grupo = grupoRepository.findById(grupoId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Grupo no encontrado"));

                if (grupo.getSensei() == null
                                || !grupo.getSensei().getId().equals(sensei.getId())) {

                        throw new RuntimeException(
                                        "No tienes acceso a este grupo");
                }

                return grupo;
        }

        /*
         * =============================================================
         * ELIMINAR GRUPO
         * ADMIN / SECRETARIA
         * =============================================================
         */

        @Transactional
        public void eliminarGrupo(Long id) {

                if (!grupoRepository.existsById(id)) {

                        throw new RuntimeException(
                                        "Grupo no encontrado");
                }

                grupoRepository.deleteById(id);
        }

        /*
         * =============================================================
         * CREAR GRUPO
         * ADMIN / SECRETARIA
         * =============================================================
         */

        @Transactional
        public Grupo crearGrupo(
                        String nombre,
                        String descripcion,
                        Integer capacidad,
                        Long senseiId,
                        Long frecuenciaId) {

                nombre = normalizarObligatorio(
                                nombre,
                                "El nombre del grupo es obligatorio");

                descripcion = normalizarObligatorio(
                                descripcion,
                                "La descripción del grupo es obligatoria");

                if (grupoRepository.findByNombre(nombre).isPresent()) {

                        throw new RuntimeException(
                                        "El nombre del grupo ya existe");
                }

                validarCapacidad(capacidad);

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

        /*
         * =============================================================
         * ACTUALIZAR GRUPO
         * ADMIN / SECRETARIA
         * =============================================================
         */

        @Transactional
        public Grupo actualizarGrupo(
                        Long id,
                        String nombre,
                        String descripcion,
                        Integer capacidad,
                        Long senseiId,
                        Long frecuenciaId) {

                Grupo grupo = grupoRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException(
                                                "Grupo no encontrado"));

                nombre = normalizarObligatorio(
                                nombre,
                                "El nombre del grupo es obligatorio");

                descripcion = normalizarObligatorio(
                                descripcion,
                                "La descripción del grupo es obligatoria");

                if (!grupo.getNombre().equals(nombre)
                                && grupoRepository.findByNombre(nombre).isPresent()) {

                        throw new RuntimeException(
                                        "El nombre del grupo ya existe");
                }

                validarCapacidad(capacidad);

                long estudiantesActivos = estudianteGrupoRepository
                                .countByGrupoIdAndEstado(
                                                id,
                                                "ACTIVO");

                if (capacidad < estudiantesActivos) {

                        throw new RuntimeException(
                                        "La capacidad no puede ser menor que la cantidad de estudiantes activos");
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

        /*
         * =============================================================
         * CAMBIAR ESTADO
         * ADMIN / SECRETARIA
         * =============================================================
         */

        @Transactional
        public Grupo cambiarEstado(
                        Long id,
                        String estado) {

                Grupo grupo = grupoRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException(
                                                "Grupo no encontrado"));

                validarEstado(estado);

                grupo.setEstado(estado.toUpperCase());

                return grupoRepository.save(grupo);
        }

        /*
         * =============================================================
         * CONTAR ESTUDIANTES ACTIVOS
         * =============================================================
         */

        public long contarEstudiantesActivos(Long grupoId) {

                return estudianteGrupoRepository
                                .countByGrupoIdAndEstado(
                                                grupoId,
                                                "ACTIVO");
        }

        /*
         * =============================================================
         * OBTENER SENSEI AUTENTICADO
         * =============================================================
         */

        private Usuario obtenerSenseiAutenticado(String username) {

                Usuario usuario = usuarioRepository
                                .findByUsername(username)
                                .orElseThrow(() -> new RuntimeException(
                                                "Usuario autenticado no encontrado"));

                if (usuario.getRol() == null
                                || !"SENSEI".equalsIgnoreCase(
                                                usuario.getRol().getNombre())) {

                        throw new RuntimeException(
                                        "El usuario autenticado no tiene el rol SENSEI");
                }

                if (!"ACTIVO".equalsIgnoreCase(usuario.getEstado())) {

                        throw new RuntimeException(
                                        "El Sensei no se encuentra activo");
                }

                return usuario;
        }

        /*
         * =============================================================
         * OBTENER SENSEI PARA ASIGNACIÓN DE GRUPOS
         * =============================================================
         */

        private Usuario obtenerSensei(Long senseiId) {

                Usuario usuario = usuarioRepository
                                .findById(senseiId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Sensei no encontrado"));

                if (usuario.getRol() == null
                                || !"SENSEI".equalsIgnoreCase(
                                                usuario.getRol().getNombre())) {

                        throw new RuntimeException(
                                        "El usuario seleccionado no tiene el rol SENSEI");
                }

                if (!"ACTIVO".equalsIgnoreCase(usuario.getEstado())) {

                        throw new RuntimeException(
                                        "El sensei seleccionado no está activo");
                }

                return usuario;
        }

        /*
         * =============================================================
         * OBTENER FRECUENCIA
         * =============================================================
         */

        private FrecuenciaGrupo obtenerFrecuencia(Long frecuenciaId) {

                if (frecuenciaId == null) {

                        throw new RuntimeException(
                                        "La frecuencia semanal es obligatoria");
                }

                return frecuenciaGrupoRepository
                                .findById(frecuenciaId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Frecuencia de grupo no encontrada"));
        }

        /*
         * =============================================================
         * VALIDAR ESTADO
         * =============================================================
         */

        private void validarEstado(String estado) {

                if (estado == null
                                || (!estado.equalsIgnoreCase("ACTIVO")
                                                && !estado.equalsIgnoreCase("INACTIVO"))) {

                        throw new RuntimeException(
                                        "El estado debe ser ACTIVO o INACTIVO");
                }
        }

        /*
         * =============================================================
         * VALIDAR CAPACIDAD
         * =============================================================
         */

        private void validarCapacidad(Integer capacidad) {

                if (capacidad == null || capacidad <= 0) {

                        throw new RuntimeException(
                                        "La capacidad debe ser mayor que 0");
                }
        }

        /*
         * =============================================================
         * NORMALIZAR CAMPOS OBLIGATORIOS
         * =============================================================
         */

        private String normalizarObligatorio(
                        String valor,
                        String mensaje) {

                if (valor == null || valor.isBlank()) {

                        throw new RuntimeException(mensaje);
                }

                return valor.trim();
        }
}
