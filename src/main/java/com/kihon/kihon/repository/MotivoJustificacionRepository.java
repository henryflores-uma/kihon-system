package com.kihon.kihon.repository;

import com.kihon.kihon.model.MotivoJustificacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MotivoJustificacionRepository
        extends JpaRepository<MotivoJustificacion, Long> {

    Optional<MotivoJustificacion> findByNombre(String nombre);

    List<MotivoJustificacion> findAllByOrderByIdAsc();
}