package com.kihon.kihon.repository;

import com.kihon.kihon.model.Cinturon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CinturonRepository
        extends JpaRepository<Cinturon, Long> {

    Optional<Cinturon> findByNombre(String nombre);

    List<Cinturon> findAllByOrderByOrdenAsc();
}