package com.gestion_medica.demo.Control;

import com.gestion_medica.demo.model.*;
import com.gestion_medica.demo.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Controller
@RequestMapping("/equipamientos")
public class EquipamientoController {

    @Autowired
    private EquipamientoService equipamientoService;

    @GetMapping
    public String listar(Model model) {
        List<Equipamiento> equipamientos = equipamientoService.findAll();
        model.addAttribute("equipamientos", equipamientos);
        return "equipamientos/lista";
    }

    @GetMapping("/nuevo")
    public String nuevo(Model model) {
        model.addAttribute("equipamiento", new Equipamiento());
        return "equipamientos/form";
    }

    @PostMapping("/guardar")
    public String guardar(@ModelAttribute Equipamiento equipamiento) {
        equipamientoService.save(equipamiento);
        return "redirect:/equipamientos";
    }

    @GetMapping("/eliminar/{id}")
    public String eliminar(@PathVariable Integer id) {
        equipamientoService.deleteById(id);
        return "redirect:/equipamientos";
    }
}
