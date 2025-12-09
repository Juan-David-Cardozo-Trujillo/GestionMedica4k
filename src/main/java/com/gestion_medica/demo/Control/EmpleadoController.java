package com.gestion_medica.demo.control;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gestion_medica.demo.model.Empleado;
import com.gestion_medica.demo.model.Persona;
import com.gestion_medica.demo.service.EmpleadoService;

@RestController
@RequestMapping("/api/empleados")
// NOTA: NO poner @CrossOrigin aquí, ya está en WebConfig
public class EmpleadoController {

    @Autowired
    private EmpleadoService empleadoService;

    @GetMapping
    public List<Empleado> listar() {
        return empleadoService.findAll();
    }

    @PostMapping
    public ResponseEntity<?> guardar(@RequestBody Map<String, Object> payload) {
        try {
            // 1. Extraer Persona
            Map<String, Object> personaMap = (Map<String, Object>) payload.get("persona");

            Persona persona = new Persona();
            persona.setNumDocumento(Integer.valueOf(personaMap.get("numDocumento").toString()));
            persona.setTipoDocumento((String) personaMap.get("tipoDocumento"));
            persona.setNombrePersona((String) personaMap.get("nombrePersona"));
            persona.setApellidoPersona((String) personaMap.get("apellidoPersona"));
            persona.setGenero((String) personaMap.get("genero"));
            persona.setCorreo((String) personaMap.get("correo"));

            // Fecha segura (java.sql.Date)
            String fechaStr = (String) personaMap.get("fechaNacimiento");
            if (fechaStr != null && !fechaStr.isEmpty()) {
                persona.setFechaNacimiento(java.sql.Date.valueOf(fechaStr));
            }

            // 2. Extraer Empleado
            Map<String, Object> empData = (Map<String, Object>) payload.get("empleado");

            String cargo = (String) empData.get("cargo");
            String nombreDepartamento = (String) empData.get("nombreDepartamento");
            Integer idSede = Integer.valueOf(empData.get("idSede").toString());

            // 3. Guardar
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

    @PutMapping("/{idEmpleado}")
    public ResponseEntity<?> actualizar(@PathVariable Integer idEmpleado, 
                                        @RequestParam("numDocumento") Integer numDocumento,
                                        @RequestBody Map<String, Object> payload) {
        try {
            // 1. Parseamos los datos igual que en el guardar (reutilizando lógica)
            Map<String, Object> personaMap = (Map<String, Object>) payload.get("persona");
            Persona persona = new Persona();
            // Nota: Aquí tomamos los datos del body para actualizar nombre, etc.
            persona.setNombrePersona((String) personaMap.get("nombrePersona"));
            persona.setApellidoPersona((String) personaMap.get("apellidoPersona"));
            persona.setTipoDocumento((String) personaMap.get("tipoDocumento"));
            persona.setGenero((String) personaMap.get("genero"));
            persona.setCorreo((String) personaMap.get("correo"));
            
            String fechaStr = (String) personaMap.get("fechaNacimiento");
            if (fechaStr != null && !fechaStr.isEmpty()) {
                persona.setFechaNacimiento(java.sql.Date.valueOf(fechaStr));
            }

            Map<String, Object> empData = (Map<String, Object>) payload.get("empleado");
            String cargo = (String) empData.get("cargo");
            String nombreDepartamento = (String) empData.get("nombreDepartamento");
            Integer idSede = Integer.valueOf(empData.get("idSede").toString());

            // 2. Llamamos al servicio de ACTUALIZAR
            Empleado actualizado = empleadoService.actualizarEmpleado(
                idEmpleado, 
                numDocumento, 
                persona, 
                cargo, 
                nombreDepartamento, 
                idSede
            );
            
            return ResponseEntity.ok(actualizado);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error al actualizar: " + e.getMessage());
        }
    }
}
