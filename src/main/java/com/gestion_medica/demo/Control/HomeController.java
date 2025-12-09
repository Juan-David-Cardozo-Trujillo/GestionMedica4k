package com.gestion_medica.demo.control;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import com.gestion_medica.demo.model.Usuario;

public class HomeController {

    @GetMapping("/")
    public String index() {
        return "index";
    }

    @PostMapping("/login")
    public String login() {
        return "redirect:/dashboard";
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("ROLE_Usuario")
                .replace("ROLE_", "");

        model.addAttribute("username", username);
        model.addAttribute("userRole", role);

        return "dashboard";
    }

    // --- IMPORTANTE ---
    // He borrado TODOS los métodos que ya tienen su propio controlador
    // (reportes, sedes, departamentos, usuarios/registro, etc).
    // Si dejas alguno duplicado aquí y en otro controlador, Spring fallará.
    // El método registro() QUE ESTABA AQUÍ, LO BORRÉ.
}
