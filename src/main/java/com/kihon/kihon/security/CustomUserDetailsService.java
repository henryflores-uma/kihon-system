package com.kihon.kihon.security;

import com.kihon.kihon.model.Usuario;
import com.kihon.kihon.repository.UsuarioRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

        private final UsuarioRepository usuarioRepository;

        public CustomUserDetailsService(UsuarioRepository usuarioRepository) {
                this.usuarioRepository = usuarioRepository;
        }

        @Override
        public UserDetails loadUserByUsername(String username)
                        throws UsernameNotFoundException {

                Usuario usuario = usuarioRepository.findByUsername(username)
                                .orElseThrow(() -> new UsernameNotFoundException(
                                                "Usuario no encontrado: " + username));

                boolean cuentaActiva = "ACTIVO".equalsIgnoreCase(usuario.getEstado());

                return User.builder()
                                .username(usuario.getUsername())
                                .password(usuario.getPassword())
                                .authorities(
                                                List.of(
                                                                new SimpleGrantedAuthority(
                                                                                "ROLE_" + usuario.getRol()
                                                                                                .getNombre())))
                                .disabled(!cuentaActiva)
                                .build();
        }
}