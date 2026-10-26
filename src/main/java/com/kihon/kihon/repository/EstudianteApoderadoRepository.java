
package com.kihon.kihon.repository;

import com.kihon.kihon.model.EstudianteApoderado;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EstudianteApoderadoRepository
                extends JpaRepository<EstudianteApoderado, Long> {

        /*
         * =========================================================
         * CONSULTAR RELACIONES POR ESTUDIANTE
         * =========================================================
         */

        List<EstudianteApoderado> findByEstudianteId(
                        Long estudianteId);

        /*
         * =========================================================
         * CONSULTAR RELACIONES POR APODERADO
         * =========================================================
         */

        List<EstudianteApoderado> findByApoderadoId(
                        Long apoderadoId);

        /*
         * =========================================================
         * VERIFICAR RELACIÓN ENTRE ESTUDIANTE Y APODERADO
         * =========================================================
         */

        Optional<EstudianteApoderado> findByEstudianteIdAndApoderadoId(
                        Long estudianteId,
                        Long apoderadoId);
}
