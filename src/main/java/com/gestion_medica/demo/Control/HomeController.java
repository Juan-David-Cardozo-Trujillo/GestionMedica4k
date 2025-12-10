package com.gestion_medica.demo.control;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import com.gestion_medica.demo.model.Usuario;
import com.gestion_medica.demo.service.UsuarioService;

@Controller
public class HomeController {

    @Autowired
    private UsuarioService usuarioService;

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

    @GetMapping("/dashboard-paciente")
    public String dashboardPaciente() {
        return "dashboard-paciente";
    }

    @GetMapping("/dashboard-medico")
    public String dashboardMedico() {
        return "dashboard-medico";
    }

    @GetMapping("/usuarios")
    public String usuarios() {
        return "usuarios";
    }

    @GetMapping("/personas")
    public String personas() {
        return "personas";
    }

    @GetMapping("/pacientes")
    public String pacientes() {
        return "Pacientes";
    }

    @GetMapping("/empleados")
    public String empleados() {
        return "empleados";
    }

    @GetMapping("/historias-clinicas")
    public String historiasClinicas() {
        return "historias-clinicas";
    }

    @GetMapping("/diagnostico")
    public String diagnostico() {
        return "diagnostico";
    }

    @GetMapping("/medicamentos")
    public String medicamentos() {
        return "medicamentos";
    }

    @GetMapping("/enfermedades")
    public String enfermedades() {
        return "enfermedades";
    }

    @GetMapping("/departamentos")
    public String departamentos() {
        return "departamentos";
    }

    @GetMapping("/sedes")
    public String sedes() {
        return "sedes";
    }

    @GetMapping("/auditoria")
    public String auditoria() {
        return "auditoria";
    }

    @Autowired
    private com.gestion_medica.demo.service.EmpleadoService empleadoService;

    /**
     * Endpoint REST para login
     */
    @PostMapping("/api/login")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
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

            // Si es médico o técnico, adjuntar idEmpleado
            // Esto es crucial para que el frontend pueda filtrar datos (ej. equipamientos asignados)
            if ("Medico".equalsIgnoreCase(usuario.getRol()) || "Médico".equalsIgnoreCase(usuario.getRol()) ||
                "Tecnico".equalsIgnoreCase(usuario.getRol()) || "Técnico".equalsIgnoreCase(usuario.getRol()) ||
                "TecnicoMantenimiento".equalsIgnoreCase(usuario.getRol())) {
                com.gestion_medica.demo.model.Empleado emp = empleadoService.findByNumDocumento(usuario.getPersona().getNumDocumento());
                if (emp != null) {
                    userData.put("idEmpleado", emp.getIdEmpleado());
                }
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
     * Endpoint REST para logout
     */
    @PostMapping("/api/logout")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> logout() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("mensaje", "Logout exitoso");
        return ResponseEntity.ok(response);
    }
}
