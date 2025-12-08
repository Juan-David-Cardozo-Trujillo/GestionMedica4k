package com.gestion_medica.demo.service;

import com.gestion_medica.demo.model.Usuario;
import com.gestion_medica.demo.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByNombreUsuario(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));

        List<GrantedAuthority> authorities = new ArrayList<>();

        // Obtener el rol del usuario
        String rol = usuario.getRol() != null ? usuario.getRol() : "Usuario";
        authorities.add(new SimpleGrantedAuthority("ROLE_" + rol));

        return User.builder()
                .username(usuario.getNombreUsuario())
                .password(usuario.getContrasenaEncriptada())
                .authorities(authorities)
                .build();
    }
}
