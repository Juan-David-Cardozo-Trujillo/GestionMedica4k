package com.gestion_medica.demo.control;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import com.gestion_medica.demo.model.Usuario;
import com.gestion_medica.demo.model.Empleado;
import com.gestion_medica.demo.service.UsuarioService;
import com.gestion_medica.demo.service.EmpleadoService;

import jakarta.servlet.http.HttpSession;

@Controller
public class HomeController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private EmpleadoService empleadoService;

    @GetMapping("/")
    public String index() {
        return "index";
    }

    @GetMapping("/login")
    public String loginPage() {
        return "login";
    }

    @GetMapping("/dashboard")
    public String dashboard() {
        return "dashboard";
    }

    // ✅ MÉTODO LOGIN ACTUALIZADO
    @PostMapping("/api/login")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody Map<String, String> credentials,
            HttpSession session) {
        
        String nombreUsuario = credentials.get("nombreUsuario");
        String password = credentials.get("password");

        Map<String, Object> response = new HashMap<>();

        Optional<Usuario> usuarioOpt = usuarioService.login(nombreUsuario, password);

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            response.put("success", true);
            response.put("mensaje", "Login exitoso");
            
            Map<String, Object> userData = new HashMap<>();
            userData.put("idUsuario", usuario.getIdUsuario());
            userData.put("nombreUsuario", usuario.getNombreUsuario());
            userData.put("rol", usuario.getRol());
            userData.put("numDocumento", usuario.getPersona().getNumDocumento());

            // ✅ DETERMINAR SEDE DEL USUARIO
            Integer idSede = determinarSede(usuario);
            
            if (idSede != null) {
                userData.put("idSede", idSede);
                session.setAttribute("idSede", idSede);
                System.out.println("👤 Usuario " + nombreUsuario + " → Sede " + idSede);
            } else {
                // Default Sede 1 si no se puede determinar
                userData.put("idSede", 1);
                session.setAttribute("idSede", 1);
                System.out.println("⚠️ Usuario " + nombreUsuario + " sin sede, usando Sede 1 por defecto");
            }
            
            response.put("usuario", userData);
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("mensaje", "Usuario o contraseña incorrectos");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
    
    /**
     * Determina la sede del usuario según su rol
     */
    private Integer determinarSede(Usuario usuario) {
        String rol = usuario.getRol();
        
        // Si es Médico o Técnico, obtener sede de su departamento
        if ("Medico".equalsIgnoreCase(rol) || "Médico".equalsIgnoreCase(rol) ||
            "Tecnico".equalsIgnoreCase(rol) || "Técnico".equalsIgnoreCase(rol) ||
            "TecnicoMantenimiento".equalsIgnoreCase(rol)) {
            
            Empleado emp = empleadoService.findByNumDocumento(
                usuario.getPersona().getNumDocumento()
            );
            
            if (emp != null && emp.getDepartamento() != null) {
                return emp.getDepartamento().getIdSede();
            }
        }
        
        // Si es Paciente, podrías asignarlo a una sede por zona geográfica
        // Por ahora retornamos null para usar default
        
        return null; // Null = usar default (Sede 1)
    }

    @PostMapping("/api/logout")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> logout(HttpSession session) {
        session.invalidate();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("mensaje", "Logout exitoso");
        return ResponseEntity.ok(response);
    }
}
