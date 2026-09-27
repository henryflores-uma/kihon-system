package com.kihon.kihon.repository;

import com.kihon.kihon.model.Apoderado;
import com.kihon.kihon.model.Persona;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ApoderadoRepository
                extends JpaRepository<Apoderado, Long> {

        Optional<Apoderado> findByPersona(
                        Persona persona);
}