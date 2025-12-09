package com.gestion_medica.demo.service;

import com.gestion_medica.demo.model.Usuario;
import com.gestion_medica.demo.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UsuarioService {

    @Autowired
    private UsuarioRepository repository;

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
                && !usuario.getContrasenaEncriptada().startsWith("HASH:")) {
            String hashedPassword = hashPassword(usuario.getContrasenaEncriptada());
            usuario.setContrasenaEncriptada(hashedPassword);
        }
        return repository.save(usuario);
    }

    /**
     * Verifica las credenciales de un usuario
     */
    public boolean verificarCredenciales(String nombreUsuario, String password) {
        System.out.println("Verificando credenciales para: " + nombreUsuario);
        Optional<Usuario> usuarioOpt = findByNombreUsuario(nombreUsuario);
        System.out.println("Usuario encontrado: " + usuarioOpt.isPresent());

        if (usuarioOpt.isPresent()) {
            System.out.println("Verificando contraseñaaaaaaaaaa");
            Usuario usuario = usuarioOpt.get();
            String hashedInput = hashPassword(password);
            return hashedInput.equals(usuario.getContrasenaEncriptada());
        }
        return false;
    }

    /**
     * Intento de login - devuelve el usuario si las credenciales son correctas
     */
    public Optional<Usuario> login(String nombreUsuario, String password) {
        if (verificarCredenciales(nombreUsuario, password)) {
            System.out.println("Login exitoso para: " + nombreUsuario);
            return findByNombreUsuario(nombreUsuario);
        }
        return Optional.empty();
    }

    public void deleteById(Integer id) {
        repository.deleteById(id);
    }

    /**
     * Hash simple usando SHA-256 NOTA: En producción considera usar BCrypt o
     * Argon2
     */
    private String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            return "HASH:" + Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error al hashear contraseña", e);
        }
    }
}
