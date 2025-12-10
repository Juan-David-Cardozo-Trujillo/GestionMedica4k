package com.gestion_medica.demo.control;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gestion_medica.demo.model.Paciente;
import com.gestion_medica.demo.model.Persona;
import com.gestion_medica.demo.model.keys.PacienteId;
import com.gestion_medica.demo.service.PacienteService;
import com.gestion_medica.demo.service.PersonaService;

@RestController
@RequestMapping("/api/pacientes")
public class PacienteController {

    @Autowired
    private PacienteService pacienteService;

    @Autowired
    private PersonaService personaService;

    /**
     * GET ALL - Listar todos los pacientes con datos de persona
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllPacientes() {
        try {
            List<Paciente> pacientes = pacienteService.findAll();
            List<Map<String, Object>> response = new ArrayList<>();

            for (Paciente p : pacientes) {
                Map<String, Object> pacienteData = new HashMap<>();
                pacienteData.put("codpaciente", p.getCodPaciente());
                pacienteData.put("numdocumento", p.getNumDocumento());
                pacienteData.put("dirpaciente", p.getDirPaciente());

                // Datos de persona
                if (p.getPersona() != null) {
                    Persona persona = p.getPersona();
                    pacienteData.put("tipodocumento", persona.getTipoDocumento());
                    pacienteData.put("nombrePersona", persona.getNombrePersona());
                    pacienteData.put("apellidoPersona", persona.getApellidoPersona());
                    pacienteData.put("genero", persona.getGenero());
                    pacienteData.put("fechanacimiento", persona.getFechaNacimiento());
                    pacienteData.put("correo", persona.getCorreo());
                }

                response.add(pacienteData);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET BY ID - Obtener paciente por ID compuesto
     */
    @GetMapping("/{codPaciente}/{numDocumento}")
    public ResponseEntity<Map<String, Object>> getPacienteById(
            @PathVariable Integer codPaciente,
            @PathVariable Integer numDocumento) {

        try {
            PacienteId id = new PacienteId(codPaciente, numDocumento);
            Optional<Paciente> pacienteOpt = pacienteService.findById(id);

            if (pacienteOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Paciente p = pacienteOpt.get();
            Map<String, Object> response = new HashMap<>();

            response.put("codpaciente", p.getCodPaciente());
            response.put("numdocumento", p.getNumDocumento());
            response.put("dirpaciente", p.getDirPaciente());

            if (p.getPersona() != null) {
                Persona persona = p.getPersona();
                response.put("tipodocumento", persona.getTipoDocumento());
                response.put("nombrepersona", persona.getNombrePersona());
                response.put("apellidopersona", persona.getApellidoPersona());
                response.put("genero", persona.getGenero());
                response.put("fechanacimiento", persona.getFechaNacimiento());
                response.put("correo", persona.getCorreo());
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * POST - Crear nuevo paciente Recibe: { persona: {...}, paciente: {...} }
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createPaciente(@RequestBody Map<String, Object> data) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Extraer datos de persona
            @SuppressWarnings("unchecked")
            Map<String, Object> personaData = (Map<String, Object>) data.get("persona");

            if (personaData == null) {
                response.put("success", false);
                response.put("mensaje", "Datos de persona requeridos");
                return ResponseEntity.badRequest().body(response);
            }

            Integer numDocumento = (Integer) personaData.get("numDocumento");

            // Buscar o crear persona
            Persona persona;
            Optional<Persona> personaExistente = personaService.findById(numDocumento);

            if (personaExistente.isPresent()) {
                persona = personaExistente.get();
            } else {
                persona = new Persona();
                persona.setNumDocumento(numDocumento);
                persona.setTipoDocumento((String) personaData.get("tipoDocumento"));
                persona.setNombrePersona((String) personaData.get("nombrePersona"));
                persona.setApellidoPersona((String) personaData.get("apellidoPersona"));
                persona.setGenero((String) personaData.get("genero"));
                persona.setFechaNacimiento(java.sql.Date.valueOf((String) personaData.get("fechaNacimiento")));
                persona.setCorreo((String) personaData.get("correo"));
                persona = personaService.save(persona);
            }

            // Extraer datos de paciente
            @SuppressWarnings("unchecked")
            Map<String, Object> pacienteData = (Map<String, Object>) data.get("paciente");

            if (pacienteData == null) {
                response.put("success", false);
                response.put("mensaje", "Datos de paciente requeridos");
                return ResponseEntity.badRequest().body(response);
            }

            // Crear paciente
            Paciente paciente = new Paciente();
            paciente.setNumDocumento(numDocumento);
            paciente.setDirPaciente((String) pacienteData.get("dirPaciente"));
            paciente.setPersona(persona);

            Paciente savedPaciente = pacienteService.save(paciente);

            response.put("success", true);
            response.put("mensaje", "Paciente creado exitosamente");
            response.put("codpaciente", savedPaciente.getCodPaciente());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("mensaje", "Error al crear paciente: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * PUT - Actualizar paciente existente
     */
    @PutMapping("/{codPaciente}/{numDocumento}")
    public ResponseEntity<Map<String, Object>> updatePaciente(
            @PathVariable Integer codPaciente,
            @PathVariable Integer numDocumento,
            @RequestBody Map<String, Object> data) {

        Map<String, Object> response = new HashMap<>();

        try {
            PacienteId id = new PacienteId(codPaciente, numDocumento);
            Optional<Paciente> pacienteExistente = pacienteService.findById(id);

            if (pacienteExistente.isEmpty()) {
                response.put("success", false);
                response.put("mensaje", "Paciente no encontrado");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            Paciente paciente = pacienteExistente.get();

            // Actualizar datos de persona
            if (data.containsKey("persona")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> personaData = (Map<String, Object>) data.get("persona");
                Persona persona = paciente.getPersona();

                if (personaData.containsKey("nombrePersona")) {
                    persona.setNombrePersona((String) personaData.get("nombrePersona"));
                }
                if (personaData.containsKey("apellidoPersona")) {
                    persona.setApellidoPersona((String) personaData.get("apellidoPersona"));
                }
                if (personaData.containsKey("correo")) {
                    persona.setCorreo((String) personaData.get("correo"));
                }
                if (personaData.containsKey("genero")) {
                    persona.setGenero((String) personaData.get("genero"));
                }
                if (personaData.containsKey("fechaNacimiento")) {
                    persona.setFechaNacimiento(java.sql.Date.valueOf((String) personaData.get("fechaNacimiento")));
                }

                personaService.save(persona);
            }

            // Actualizar datos de paciente
            if (data.containsKey("paciente")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> pacienteData = (Map<String, Object>) data.get("paciente");

                if (pacienteData.containsKey("dirPaciente")) {
                    paciente.setDirPaciente((String) pacienteData.get("dirPaciente"));
                }
            }

            pacienteService.save(paciente);

            response.put("success", true);
            response.put("mensaje", "Paciente actualizado exitosamente");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("mensaje", "Error al actualizar paciente: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * DELETE - Eliminar paciente
     */
    @DeleteMapping("/{codPaciente}/{numDocumento}")
    public ResponseEntity<Map<String, Object>> deletePaciente(
            @PathVariable Integer codPaciente,
            @PathVariable Integer numDocumento) {

        Map<String, Object> response = new HashMap<>();

        try {
            PacienteId id = new PacienteId(codPaciente, numDocumento);
            Optional<Paciente> paciente = pacienteService.findById(id);

            if (paciente.isEmpty()) {
                response.put("success", false);
                response.put("mensaje", "Paciente no encontrado");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            pacienteService.deleteById(id);

            response.put("success", true);
            response.put("mensaje", "Paciente eliminado exitosamente");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("mensaje", "Error al eliminar paciente: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
