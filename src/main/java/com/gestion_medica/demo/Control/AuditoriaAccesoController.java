package com.gestion_medica.demo.control;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gestion_medica.demo.model.AuditoriaAcceso;
import com.gestion_medica.demo.model.Usuario;
import com.gestion_medica.demo.repository.AuditoriaAccesoRepository;
import com.gestion_medica.demo.repository.UsuarioRepository;

@RestController
@RequestMapping("/api/auditoria")
public class AuditoriaAccesoController {

    @Autowired
    private AuditoriaAccesoRepository auditoriaRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * GET - Listar todas las auditorías
     */
    @GetMapping
    public List<AuditoriaAcceso> listar() {
        return auditoriaRepository.findAll();
    }

    /**
     * POST - Registrar evento de auditoría
     */
    @PostMapping("/registrar")
    public ResponseEntity<Map<String, Object>> registrarEvento(
            @RequestBody Map<String, Object> datos) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            AuditoriaAcceso auditoria = new AuditoriaAcceso();
            
            // Datos básicos
            auditoria.setAccion((String) datos.get("accion")); // SELECT, INSERT, UPDATE, DELETE
            auditoria.setTablaAfectada((String) datos.get("tabla"));
            auditoria.setIpOrigen((String) datos.getOrDefault("ipOrigen", "Unknown"));
            auditoria.setFechaEvento(LocalDateTime.now());
            
            // Asociar usuario si se proporciona
            Object idUsuarioObj = datos.get("idUsuario");
            if (idUsuarioObj != null) {
                Integer idUsuario = null;
                
                // Manejar tanto Integer como String
                if (idUsuarioObj instanceof Integer) {
                    idUsuario = (Integer) idUsuarioObj;
                } else if (idUsuarioObj instanceof String) {
                    try {
                        idUsuario = Integer.parseInt((String) idUsuarioObj);
                    } catch (NumberFormatException e) {
                        // Ignorar si no se puede parsear
                    }
                }
                
                if (idUsuario != null) {
                    Usuario usuario = usuarioRepository.findById(idUsuario).orElse(null);
                    auditoria.setUsuario(usuario);
                }
            }
            
            // Guardar auditoría
            AuditoriaAcceso auditoriaGuardada = auditoriaRepository.save(auditoria);
            
            response.put("success", true);
            response.put("mensaje", "Auditoría registrada correctamente");
            response.put("idEvento", auditoriaGuardada.getIdEvento());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("mensaje", "Error al registrar auditoría: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}