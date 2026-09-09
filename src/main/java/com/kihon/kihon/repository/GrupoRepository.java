package com.kihon.kihon.repository;

import com.kihon.kihon.model.Grupo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GrupoRepository extends JpaRepository<Grupo, Long> {

    Optional<Grupo> findByNombre(String nombre);

    List<Grupo> findByEstado(String estado);
}