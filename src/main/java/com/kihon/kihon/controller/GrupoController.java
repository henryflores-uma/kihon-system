
package com.kihon.kihon.controller;

import com.kihon.kihon.dto.GrupoRequest;
import com.kihon.kihon.dto.GrupoResponse;
import com.kihon.kihon.model.Grupo;
import com.kihon.kihon.service.GrupoService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grupos")
public class GrupoController {

        private final GrupoService grupoService;

        public GrupoController(GrupoService grupoService) {
                this.grupoService = grupoService;
        }

        /*
         * =============================================================
         * CREAR GRUPO
         * ADMIN / SECRETARIA
         * =============================================================
         */

        @PostMapping
        public ResponseEntity<GrupoResponse> crearGrupo(
                        @RequestBody GrupoRequest request) {

                Grupo grupo = grupoService.crearGrupo(
                                request.getNombre(),
                                request.getDescripcion(),
                                request.getCapacidad(),
                                request.getSenseiId(),
                                request.getFrecuenciaId());

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(convertirAResponse(grupo));
        }

        /*
         * =============================================================
         * LISTAR GRUPOS
         * ADMIN / SECRETARIA: todos los grupos
         * SENSEI: solamente sus grupos asignados
         * =============================================================
         */

        @GetMapping
        public ResponseEntity<List<GrupoResponse>> listarGrupos(
                        @RequestParam(required = false) String estado,
                        Authentication authentication) {

                List<Grupo> grupos;

                if (esSensei(authentication)) {

                        grupos = grupoService.listarPorSensei(
                                        authentication.getName(),
                                        estado);

                } else {

                        if (estado == null || estado.isBlank()) {

                                grupos = grupoService.listarGrupos();

                        } else {

                                grupos = grupoService.listarPorEstado(
                                                estado.toUpperCase());
                        }
                }

                List<GrupoResponse> response = grupos
                                .stream()
                                .map(this::convertirAResponse)
                                .toList();

                return ResponseEntity.ok(response);
        }

        /*
         * =============================================================
         * BUSCAR GRUPO POR ID
         * ADMIN / SECRETARIA: cualquier grupo
         * SENSEI: solamente sus grupos asignados
         * =============================================================
         */

        @GetMapping("/{id}")
        public ResponseEntity<GrupoResponse> buscarPorId(
                        @PathVariable Long id,
                        Authentication authentication) {

                Grupo grupo;

                if (esSensei(authentication)) {

                        grupo = grupoService.buscarPorIdDeSensei(
                                        id,
                                        authentication.getName());

                } else {

                        grupo = grupoService.buscarPorId(id);
                }

                return ResponseEntity.ok(
                                convertirAResponse(grupo));
        }

        /*
         * =============================================================
         * ACTUALIZAR GRUPO
         * ADMIN / SECRETARIA
         * =============================================================
         */

        @PutMapping("/{id}")
        public ResponseEntity<GrupoResponse> actualizarGrupo(
                        @PathVariable Long id,
                        @RequestBody GrupoRequest request) {

                Grupo grupo = grupoService.actualizarGrupo(
                                id,
                                request.getNombre(),
                                request.getDescripcion(),
                                request.getCapacidad(),
                                request.getSenseiId(),
                                request.getFrecuenciaId());

                return ResponseEntity.ok(
                                convertirAResponse(grupo));
        }

        /*
         * =============================================================
         * CAMBIAR ESTADO
         * ADMIN / SECRETARIA
         * =============================================================
         */

        @PatchMapping("/{id}/estado")
        public ResponseEntity<GrupoResponse> cambiarEstado(
                        @PathVariable Long id,
                        @RequestParam String estado) {

                Grupo grupo = grupoService.cambiarEstado(
                                id,
                                estado.toUpperCase());

                return ResponseEntity.ok(
                                convertirAResponse(grupo));
        }

        /*
         * =============================================================
         * ELIMINAR GRUPO
         * ADMIN / SECRETARIA
         * =============================================================
         */

        @DeleteMapping("/{id}")
        public ResponseEntity<Void> eliminarGrupo(
                        @PathVariable Long id) {

                grupoService.eliminarGrupo(id);

                return ResponseEntity
                                .noContent()
                                .build();
        }

        /*
         * =============================================================
         * IDENTIFICAR ROL DEL USUARIO AUTENTICADO
         * =============================================================
         */

        private boolean esSensei(Authentication authentication) {

                if (authentication == null
                                || authentication.getAuthorities() == null) {
                        return false;
                }

                for (GrantedAuthority authority : authentication.getAuthorities()) {

                        if (authority != null
                                        && "ROLE_SENSEI".equals(authority.getAuthority())) {
                                return true;
                        }
                }

                return false;
        }

        /*
         * =============================================================
         * CONVERTIR ENTIDAD A RESPONSE
         * =============================================================
         */

        private GrupoResponse convertirAResponse(Grupo grupo) {

                long estudiantesActivos = grupoService
                                .contarEstudiantesActivos(grupo.getId());

                long cuposDisponibles = grupo.getCapacidad()
                                - estudiantesActivos;

                String senseiNombre = null;

                if (grupo.getSensei() != null
                                && grupo.getSensei().getPersona() != null) {

                        senseiNombre = grupo.getSensei()
                                        .getPersona()
                                        .getNombre()
                                        + " "
                                        + grupo.getSensei()
                                                        .getPersona()
                                                        .getApellido();
                }

                return new GrupoResponse(
                                grupo.getId(),
                                grupo.getNombre(),
                                grupo.getDescripcion(),
                                grupo.getCapacidad(),
                                estudiantesActivos,
                                cuposDisponibles,
                                grupo.getEstado(),
                                grupo.getSensei() != null
                                                ? grupo.getSensei().getId()
                                                : null,
                                senseiNombre,
                                grupo.getFrecuencia() != null
                                                ? grupo.getFrecuencia().getId()
                                                : null,
                                grupo.getFrecuencia() != null
                                                ? grupo.getFrecuencia().getNombre()
                                                : null,
                                grupo.getFrecuencia() != null
                                                ? grupo.getFrecuencia().getFrecuenciaSemanal()
                                                : null);
        }
}
