package com.kihon.kihon.repository;

import com.kihon.kihon.model.Apoderado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ApoderadoRepository
        extends JpaRepository<Apoderado, Long> {

    Optional<Apoderado> findByDocumento(
            String documento);

    Optional<Apoderado> findByCorreo(
            String correo);
}