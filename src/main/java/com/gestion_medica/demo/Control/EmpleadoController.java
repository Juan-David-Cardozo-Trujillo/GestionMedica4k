package com.gestion_medica.demo.Control;

import com.gestion_medica.demo.model.*;
import com.gestion_medica.demo.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Controller
@RequestMapping("/empleados")
public class EmpleadoController {

    @Autowired
    private EmpleadoService empleadoService;

    @Autowired
    private PersonaService personaService;

    @Autowired
    private SedeHospitalariaService sedeService;

    @GetMapping
    public String listar(Model model) {
        List<Empleado> empleados = empleadoService.findAll();
        model.addAttribute("empleados", empleados);
        return "empleados/lista";
    }

    @GetMapping("/nuevo")
    public String nuevo(Model model) {
        model.addAttribute("empleado", new Empleado());
        model.addAttribute("personas", personaService.findAll());
        model.addAttribute("sedes", sedeService.findAll());
        return "empleados/form";
    }

    @PostMapping("/guardar")
    public String guardar(@ModelAttribute Empleado empleado) {
        empleadoService.save(empleado);
        return "redirect:/empleados";
    }

    @GetMapping("/eliminar/{numDocumento}/{idEmpleado}")
    public String eliminar(@PathVariable Integer numDocumento,
            @PathVariable Integer idEmpleado) {
        empleadoService.deleteById(new com.gestion_medica.demo.model.keys.EmpleadoId(numDocumento, idEmpleado));
        return "redirect:/empleados";
    }
}
