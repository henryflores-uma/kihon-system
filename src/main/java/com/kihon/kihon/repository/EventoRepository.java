package com.kihon.kihon.repository;

import com.kihon.kihon.model.Evento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface EventoRepository
        extends JpaRepository<Evento, Long> {

    List<Evento> findByFechaBetween(
            LocalDate fechaInicio,
            LocalDate fechaFin);

    List<Evento> findByFechaAndEstado(
            LocalDate fecha,
            String estado);

    List<Evento> findByEstado(
            String estado);
}