package com.gestion_medica.demo.Control;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gestion_medica.demo.model.Departamento;
import com.gestion_medica.demo.model.keys.DepartamentoId;
import com.gestion_medica.demo.service.DepartamentoService;

@RestController
@RequestMapping("/api/departamentos")
public class DepartamentoController {

    @Autowired
    private DepartamentoService departamentoService;

    @GetMapping
    public List<Map<String, Object>> listar(@RequestParam(required = false) Integer idSede) {
        List<Departamento> departamentos;
        
        // Si se proporciona idSede, filtrar por esa sede
        if (idSede != null) {
            departamentos = departamentoService.findAll().stream()
                    .filter(d -> d.getIdSede().equals(idSede))
                    .toList();
        } else {
            departamentos = departamentoService.findAll();
        }
        
        List<Map<String, Object>> response = new ArrayList<>();
        for (Departamento dept : departamentos) {
            Map<String, Object> deptData = new HashMap<>();
            deptData.put("nombredepartamento", dept.getNombreDepartamento());
            deptData.put("idsede", dept.getIdSede());
            response.add(deptData);
        }
        
        return response;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> guardar(@RequestBody Departamento departamento) {
        try {
            // Validar que los campos obligatorios no sean nulos
            if (departamento.getNombreDepartamento() == null || departamento.getNombreDepartamento().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "El nombre del departamento es obligatorio"));
            }
            if (departamento.getIdSede() == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "El ID de la sede es obligatorio"));
            }
            
            // Como la entidad tiene los campos planos nombreDepartamento e idSede,
            // Spring Boot mapea el JSON automáticamente. No necesitamos DTOs complejos aquí.
            Departamento nuevo = departamentoService.save(departamento);
            
            Map<String, Object> response = new HashMap<>();
            response.put("nombredepartamento", nuevo.getNombreDepartamento());
            response.put("idsede", nuevo.getIdSede());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Error al guardar: " + e.getMessage()));
        }
    }

    // OJO: Manejo de llave compuesta en la URL
    @DeleteMapping("/{nombre}/{idSede}")
    public ResponseEntity<?> eliminar(@PathVariable String nombre, @PathVariable Integer idSede) {
        try {
            DepartamentoId id = new DepartamentoId(nombre, idSede);
            departamentoService.deleteById(id);
            return ResponseEntity.ok("Departamento eliminado correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al eliminar: " + e.getMessage());
        }
    }
}
