package com.gestion_medica.demo.control;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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
    public List<Departamento> listar() {
        return departamentoService.findAll();
    }

    @PostMapping
    public ResponseEntity<?> guardar(@RequestBody Departamento departamento) {
        try {
            // Como la entidad tiene los campos planos nombreDepartamento e idSede,
            // Spring Boot mapea el JSON automáticamente. No necesitamos DTOs complejos aquí.
            Departamento nuevo = departamentoService.save(departamento);
            return ResponseEntity.ok(nuevo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al guardar: " + e.getMessage());
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
