package com.gestion_medica.demo.control;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gestion_medica.demo.model.Empleado;
import com.gestion_medica.demo.model.Persona;
import com.gestion_medica.demo.service.EmpleadoService;

@RestController
@RequestMapping("/api/empleados")
@CrossOrigin(origins = "*")
public class EmpleadoController {

    @Autowired
    private EmpleadoService empleadoService;

    // YA NO USAMOS OBJECTMAPPER PARA EVITAR EL ERROR DE IMPORTACIÓN
    @GetMapping
    public List<Empleado> listar() {
        return empleadoService.findAll();
    }

    @PostMapping
    public ResponseEntity<?> guardar(@RequestBody Map<String, Object> payload) {
        try {
            // 1. Extraer datos del mapa "persona" MANUALMENTE
            Map<String, Object> personaMap = (Map<String, Object>) payload.get("persona");

            Persona persona = new Persona();
            persona.setNumDocumento(Integer.valueOf(personaMap.get("numDocumento").toString()));
            persona.setTipoDocumento((String) personaMap.get("tipoDocumento"));
            persona.setNombrePersona((String) personaMap.get("nombrePersona"));
            persona.setApellidoPersona((String) personaMap.get("apellidoPersona"));
            persona.setGenero((String) personaMap.get("genero"));
            persona.setCorreo((String) personaMap.get("correo"));

            // --- CORRECCIÓN AQUÍ: Usamos java.sql.Date ---
            String fechaStr = (String) personaMap.get("fechaNacimiento");
            if (fechaStr != null && !fechaStr.isEmpty()) {
                // valueOf convierte String "2023-01-01" a java.sql.Date directamente
                persona.setFechaNacimiento(java.sql.Date.valueOf(fechaStr));
            }
            // ---------------------------------------------

            // 2. Extraer datos del mapa "empleado" MANUALMENTE
            Map<String, Object> empData = (Map<String, Object>) payload.get("empleado");

            String cargo = (String) empData.get("cargo");
            String nombreDepartamento = (String) empData.get("nombreDepartamento");
            Integer idSede = Integer.valueOf(empData.get("idSede").toString());

            // 3. Llamar al servicio
            Empleado nuevo = empleadoService.registrarEmpleadoSinDTO(persona, cargo, nombreDepartamento, idSede);

            return ResponseEntity.ok(nuevo);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error al guardar: " + e.getMessage());
        }
    }

    @DeleteMapping("/{idEmpleado}")
    public ResponseEntity<?> eliminar(@PathVariable Integer idEmpleado,
            @RequestParam("numDocumento") Integer numDocumento) {
        try {
            empleadoService.eliminarEmpleado(numDocumento, idEmpleado);
            return ResponseEntity.ok("Empleado eliminado correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al eliminar: " + e.getMessage());
        }
    }
}
