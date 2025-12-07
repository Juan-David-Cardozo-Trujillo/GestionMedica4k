package com.gestion_medica.demo.Control;

import com.gestion_medica.demo.model.*;
import com.gestion_medica.demo.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Controller
@RequestMapping("/citas")
public class CitaController {

    @Autowired
    private CitaService citaService;

    @Autowired
    private EmpleadoService empleadoService;

    @Autowired
    private PacienteService pacienteService;

    @GetMapping
    public String listar(Model model) {
        List<Cita> citas = citaService.findAll();
        model.addAttribute("citas", citas);
        return "citas/lista";
    }

    @GetMapping("/nuevo")
    public String nuevo(Model model) {
        model.addAttribute("cita", new Cita());
        model.addAttribute("empleados", empleadoService.findAll());
        model.addAttribute("pacientes", pacienteService.findAll());
        return "citas/form";
    }

    @PostMapping("/guardar")
    public String guardar(@ModelAttribute Cita cita) {
        citaService.save(cita);
        return "redirect:/citas";
    }

    @GetMapping("/eliminar/{id}")
    public String eliminar(@PathVariable Integer id) {
        citaService.deleteById(id);
        return "redirect:/citas";
    }
}
