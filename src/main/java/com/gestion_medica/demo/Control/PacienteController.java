package com.gestion_medica.demo.Control;

import com.gestion_medica.demo.model.*;
import com.gestion_medica.demo.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Controller
@RequestMapping("/pacientes")
public class PacienteController {

    @Autowired
    private PacienteService pacienteService;

    @Autowired
    private PersonaService personaService;

    @GetMapping
    public String listar(Model model) {
        List<Paciente> pacientes = pacienteService.findAll();
        model.addAttribute("pacientes", pacientes);
        return "pacientes/lista";
    }

    @GetMapping("/nuevo")
    public String nuevo(Model model) {
        model.addAttribute("paciente", new Paciente());
        model.addAttribute("personas", personaService.findAll());
        return "pacientes/form";
    }

    @PostMapping("/guardar")
    public String guardar(@ModelAttribute Paciente paciente) {
        pacienteService.save(paciente);
        return "redirect:/pacientes";
    }

    @GetMapping("/eliminar/{codPaciente}/{numDocumento}")
    public String eliminar(@PathVariable Integer codPaciente,
            @PathVariable Integer numDocumento) {
        pacienteService.deleteById(new com.gestion_medica.demo.model.keys.PacienteId(codPaciente, numDocumento));
        return "redirect:/pacientes";
    }
}
