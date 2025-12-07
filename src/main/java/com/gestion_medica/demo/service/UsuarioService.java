package com.gestion_medica.demo.service;

import com.gestion_medica.demo.model.Usuario;
import com.gestion_medica.demo.repository.UsuarioRepository;
import com.gestion_medica.demo.util.PasswordHashingUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UsuarioService {

    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private PasswordHashingUtil passwordHashingUtil;

    public List<Usuario> findAll() {
        return repository.findAll();
    }

    public Optional<Usuario> findById(Integer id) {
        return repository.findById(id);
    }

    public Optional<Usuario> findByNombreUsuario(String nombreUsuario) {
        return repository.findByNombreUsuario(nombreUsuario);
    }

    /**
     * Guarda un usuario hasheando su contraseña automáticamente
     */
    public Usuario save(Usuario usuario) {
        // Si es un nuevo usuario o la contraseña ha cambiado, hashear
        if (usuario.getContrasenaEncriptada() != null
                && !usuario.getContrasenaEncriptada().startsWith("$2a$")) {
            String hashedPassword = passwordHashingUtil.hashPassword(usuario.getContrasenaEncriptada());
            usuario.setContrasenaEncriptada(hashedPassword);
        }
        return repository.save(usuario);
    }

    /**
     * Verifica las credenciales de un usuario
     */
    public boolean verificarCredenciales(String nombreUsuario, String password) {
        Optional<Usuario> usuarioOpt = findByNombreUsuario(nombreUsuario);
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            return passwordHashingUtil.verifyPassword(password, usuario.getContrasenaEncriptada());
        }
        return false;
    }

    public void deleteById(Integer id) {
        repository.deleteById(id);
    }
}
