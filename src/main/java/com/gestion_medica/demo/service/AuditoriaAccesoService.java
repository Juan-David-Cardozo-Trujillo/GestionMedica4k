package com.gestion_medica.demo.service;

import com.gestion_medica.demo.model.AuditoriaAcceso;
import com.gestion_medica.demo.model.Usuario;
import com.gestion_medica.demo.repository.AuditoriaAccesoRepository;
import com.gestion_medica.demo.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class AuditoriaAccesoService {

    @Autowired
    private AuditoriaAccesoRepository repository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public List<AuditoriaAcceso> findAll() {
        return repository.findAll();
    }

    // --- MÉTODO MAESTRO PARA REGISTRAR AUDITORÍA ---
    public void registrarAccion(String accion, String tabla, String ip, Integer idUsuario) {
        try {
            AuditoriaAcceso audit = new AuditoriaAcceso();
            audit.setAccion(accion);
            audit.setTablaAfectada(tabla);
            audit.setIpOrigen(ip != null ? ip : "Unknown");
            audit.setFechaEvento(LocalDateTime.now());

            // Buscar el usuario si se proporciona ID
            if (idUsuario != null) {
                Usuario user = usuarioRepository.findById(idUsuario).orElse(null);
                audit.setUsuario(user);
                // Si el usuario tiene un empleado asociado (opcional), podrías setearlo aquí también
                // audit.setEmpleado(...); 
            }

            repository.save(audit);
            System.out.println("📝 Auditoría registrada: " + accion + " en " + tabla);
        } catch (Exception e) {
            System.err.println("Error registrando auditoría: " + e.getMessage());
            // No lanzamos error para no interrumpir la operación principal
        }
    }
}
