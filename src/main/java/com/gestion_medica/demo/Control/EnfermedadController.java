package com.gestion_medica.demo.Control;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gestion_medica.demo.model.Enfermedad;
import com.gestion_medica.demo.service.EnfermedadService;

@RestController
@RequestMapping("/api/enfermedades")
// NOTA: No ponemos @CrossOrigin porque ya está en WebConfig
public class EnfermedadController {

    @Autowired
    private EnfermedadService enfermedadService;

    @GetMapping
    public List<Enfermedad> listar() {
        return enfermedadService.findAll();
    }

    @PostMapping
    public ResponseEntity<?> guardar(@RequestBody Enfermedad enfermedad) {
        try {
            Enfermedad nueva = enfermedadService.save(enfermedad);
            return ResponseEntity.ok(nueva);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al guardar: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Enfermedad enfermedad) {
        try {
            // Verificamos si existe
            if (!enfermedadService.findById(id).isPresent()) {
                return ResponseEntity.notFound().build();
            }
            // Forzamos el ID del path en el objeto para asegurar que se actualice y no se cree uno nuevo
            enfermedad.setIdEnfermedad(id);
            Enfermedad actualizada = enfermedadService.save(enfermedad);
            return ResponseEntity.ok(actualizada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al actualizar: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            enfermedadService.deleteById(id);
            return ResponseEntity.ok("Enfermedad eliminada");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al eliminar: " + e.getMessage());
        }
    }
}
