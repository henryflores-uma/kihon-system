package com.kihon.kihon.repository;

import com.kihon.kihon.model.Persona;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PersonaRepository extends JpaRepository<Persona, Long> {

    Optional<Persona> findByCorreo(String correo);

    Optional<Persona> findByTipoDocumentoIdAndNumeroDocumento(
            Long tipoDocumentoId,
            String numeroDocumento);
}