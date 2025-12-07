package com.gestion_medica.demo.Control;

import com.gestion_medica.demo.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/reportes")
public class ReporteController {

    @Autowired
    private ReporteService reporteService;

    @GetMapping
    public String menu() {
        return "reportes/menu";
    }

    @GetMapping("/medicamentos-recetados")
    public String medicamentosRecetados(Model model) {
        List<Map<String, Object>> datos = reporteService.getMedicamentosMasRecetadosPorSede();
        model.addAttribute("datos", datos);
        return "reportes/medicamentos-recetados";
    }

    @GetMapping("/medicos-consultas")
    public String medicosConsultas(Model model) {
        List<Map<String, Object>> datos = reporteService.getMedicosConMasConsultasPorSemana();
        model.addAttribute("datos", datos);
        return "reportes/medicos-consultas";
    }

    @GetMapping("/tiempo-promedio")
    public String tiempoPromedio(Model model) {
        Map<String, Object> datos = reporteService.getTiempoPromedioCitaDiagnostico();
        model.addAttribute("datos", datos);
        return "reportes/tiempo-promedio";
    }

    @GetMapping("/auditoria")
    public String auditoria(Model model) {
        List<Map<String, Object>> datos = reporteService.getAuditoriaHistoriasClinicas();
        model.addAttribute("datos", datos);
        return "reportes/auditoria";
    }

    @GetMapping("/departamentos-equipamiento")
    public String departamentosEquipamiento(Model model) {
        List<Map<String, Object>> datos = reporteService.getDepartamentosCompartenEquipamiento();
        model.addAttribute("datos", datos);
        return "reportes/departamentos-equipamiento";
    }

    @GetMapping("/pacientes-enfermedad")
    public String pacientesEnfermedad(Model model) {
        List<Map<String, Object>> datos = reporteService.getPacientesPorEnfermedadYSede();
        model.addAttribute("datos", datos);
        return "reportes/pacientes-enfermedad";
    }
}
