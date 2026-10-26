package com.kihon.kihon.repository;

import com.kihon.kihon.model.TipoDocumento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TipoDocumentoRepository
        extends JpaRepository<TipoDocumento, Long> {

    Optional<TipoDocumento> findByNombre(String nombre);
}