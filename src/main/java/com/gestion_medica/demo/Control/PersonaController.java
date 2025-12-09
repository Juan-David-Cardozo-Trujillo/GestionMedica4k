package com.gestion_medica.demo.Control;

import com.gestion_medica.demo.model.Persona;
import com.gestion_medica.demo.service.PersonaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/personas")
// NOTA: No necesitamos @CrossOrigin porque ya está en WebConfig
public class PersonaController {

    @Autowired
    private PersonaService personaService;

    @GetMapping
    public List<Persona> listar() {
        return personaService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Integer id) {
        return personaService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> guardar(@RequestBody Persona persona) {
        try {
            // Validamos si ya existe el documento para no sobrescribir sin querer
            if (personaService.findById(persona.getNumDocumento()).isPresent()) {
                return ResponseEntity.badRequest().body("Error: El número de documento ya existe.");
            }
            Persona nueva = personaService.save(persona);
            return ResponseEntity.ok(nueva);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al guardar: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Persona persona) {
        try {
            if (!personaService.findById(id).isPresent()) {
                return ResponseEntity.notFound().build();
            }
            // Aseguramos que el ID del objeto coincida con la URL
            persona.setNumDocumento(id);
            Persona actualizada = personaService.save(persona);
            return ResponseEntity.ok(actualizada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al actualizar: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            personaService.deleteById(id);
            return ResponseEntity.ok("Persona eliminada correctamente");
        } catch (Exception e) {
            // Captura errores de Llave Foránea (si la persona es empleado o usuario)
            return ResponseEntity.badRequest().body("No se puede eliminar: La persona está vinculada a otros registros.");
        }
    }
}
