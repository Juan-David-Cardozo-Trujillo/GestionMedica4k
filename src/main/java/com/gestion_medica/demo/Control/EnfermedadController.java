package com.gestion_medica.demo.control;

import com.gestion_medica.demo.config.SedeContextHolder;
import com.gestion_medica.demo.model.Enfermedad;
import com.gestion_medica.demo.service.EnfermedadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enfermedades")
public class EnfermedadController {

    @Autowired
    private EnfermedadService enfermedadService;

    /**
     * Listar enfermedades - SIEMPRE desde BD COMPARTIDA
     */
    @GetMapping
    public List<Enfermedad> listar() {
        // Forzar uso de BD compartida
        SedeContextHolder.setSedeDataSource("SHARED");
        return enfermedadService.findAll();
    }

    /**
     * Guardar enfermedad - SIEMPRE en BD COMPARTIDA
     */
    @PostMapping
    public ResponseEntity<?> guardar(@RequestBody Enfermedad enfermedad) {
        try {
            // Forzar uso de BD compartida
            SedeContextHolder.setSedeDataSource("SHARED");
            Enfermedad nueva = enfermedadService.save(enfermedad);
            return ResponseEntity.ok(nueva);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
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
