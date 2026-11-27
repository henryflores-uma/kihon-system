package com.kihon.kihon.repository;

import com.kihon.kihon.model.TipoEvento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TipoEventoRepository
        extends JpaRepository<TipoEvento, Long> {

    Optional<TipoEvento> findByNombre(String nombre);
}