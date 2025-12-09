package com.gestion_medica.demo.control;

import com.gestion_medica.demo.model.Departamento;
import com.gestion_medica.demo.model.keys.DepartamentoId;
import com.gestion_medica.demo.service.DepartamentoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departamentos")
@CrossOrigin(origins = "*") // Para Live Server
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
