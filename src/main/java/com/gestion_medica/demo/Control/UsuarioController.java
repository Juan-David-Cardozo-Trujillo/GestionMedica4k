package com.gestion_medica.demo.Control;

import com.gestion_medica.demo.model.*;
import com.gestion_medica.demo.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private PersonaService personaService;

    @GetMapping("/registro")
    public String registro(Model model) {
        model.addAttribute("usuario", new Usuario());
        model.addAttribute("personas", personaService.findAll());
        return "usuarios/registro";
    }

    @PostMapping("/registrar")
    public String registrar(@ModelAttribute Usuario usuario) {
        usuarioService.save(usuario);
        return "redirect:/login?registroExitoso";
    }
}
