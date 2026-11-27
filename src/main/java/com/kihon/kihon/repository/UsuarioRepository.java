package com.kihon.kihon.repository;

import com.kihon.kihon.model.Persona;
import com.kihon.kihon.model.Usuario;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByUsername(String username);

    Optional<Usuario> findByPersona(Persona persona);

    List<Usuario> findByRolNombreAndEstado(
            String nombreRol,
            String estado);
}