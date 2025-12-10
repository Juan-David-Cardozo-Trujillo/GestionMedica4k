package com.gestion_medica.demo.Control;

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

import com.gestion_medica.demo.model.Cita;
import com.gestion_medica.demo.model.Empleado;
import com.gestion_medica.demo.model.Paciente;
import com.gestion_medica.demo.repository.EmpleadoRepository;
import com.gestion_medica.demo.service.CitaService;
import com.gestion_medica.demo.service.EmpleadoService;
import com.gestion_medica.demo.service.PacienteService;

@RestController
@RequestMapping("/api/citas")
public class CitaRestController {

    @Autowired
    private CitaService citaService;

    @Autowired
    private EmpleadoService empleadoService;
    
    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private PacienteService pacienteService;

    /**
     * GET ALL - Listar todas las citas
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllCitas() {
        try {
            List<Cita> citas = citaService.findAll();
            List<Map<String, Object>> response = new ArrayList<>();

            for (Cita cita : citas) {
                Map<String, Object> citaData = new HashMap<>();
                citaData.put("idcita", cita.getIdCita());
                citaData.put("tiposervicio", cita.getTipoServicio());
                citaData.put("estado", cita.getEstado());
                citaData.put("fecha", cita.getFecha());
                citaData.put("hora", cita.getHora());

                // Datos del empleado (médico)
                if (cita.getEmpleado() != null) {
                    Map<String, Object> medicoData = new HashMap<>();
                    medicoData.put("idempleado", cita.getEmpleado().getIdEmpleado());
                    medicoData.put("numdocumento", cita.getEmpleado().getNumDocumento());
                    medicoData.put("cargo", cita.getEmpleado().getCargo());
                    
                    if (cita.getEmpleado().getPersona() != null) {
                        medicoData.put("nombrePersona", cita.getEmpleado().getPersona().getNombrePersona());
                        medicoData.put("apellidoPersona", cita.getEmpleado().getPersona().getApellidoPersona());
                    }
                    
                    if (cita.getEmpleado().getDepartamento() != null) {
                        medicoData.put("nombredepartamento", cita.getEmpleado().getDepartamento().getNombreDepartamento());
                    }
                    
                    citaData.put("medico", medicoData);
                }

                // Datos del paciente
                if (cita.getPaciente() != null) {
                    Map<String, Object> pacienteData = new HashMap<>();
                    pacienteData.put("codpaciente", cita.getPaciente().getCodPaciente());
                    pacienteData.put("numdocumento", cita.getPaciente().getNumDocumento());
                    pacienteData.put("dirpaciente", cita.getPaciente().getDirPaciente());
                    
                    if (cita.getPaciente().getPersona() != null) {
                        pacienteData.put("nombrePersona", cita.getPaciente().getPersona().getNombrePersona());
                        pacienteData.put("apellidoPersona", cita.getPaciente().getPersona().getApellidoPersona());
                    }
                    
                    citaData.put("paciente", pacienteData);
                }

                response.add(citaData);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET BY ID - Obtener cita por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getCitaById(@PathVariable Integer id) {
        try {
            Optional<Cita> citaOpt = citaService.findById(id);
            
            if (citaOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Cita cita = citaOpt.get();
            Map<String, Object> citaData = new HashMap<>();
            citaData.put("idcita", cita.getIdCita());
            citaData.put("tiposervicio", cita.getTipoServicio());
            citaData.put("estado", cita.getEstado());
            citaData.put("fecha", cita.getFecha());
            citaData.put("hora", cita.getHora());

            // Incluir datos relacionados
            if (cita.getEmpleado() != null) {
                Map<String, Object> medicoData = new HashMap<>();
                medicoData.put("idempleado", cita.getEmpleado().getIdEmpleado());
                medicoData.put("numdocumento", cita.getEmpleado().getNumDocumento());
                if (cita.getEmpleado().getPersona() != null) {
                    medicoData.put("nombrePersona", cita.getEmpleado().getPersona().getNombrePersona());
                    medicoData.put("apellidoPersona", cita.getEmpleado().getPersona().getApellidoPersona());
                }
                citaData.put("medico", medicoData);
            }

            if (cita.getPaciente() != null) {
                Map<String, Object> pacienteData = new HashMap<>();
                pacienteData.put("codpaciente", cita.getPaciente().getCodPaciente());
                pacienteData.put("numdocumento", cita.getPaciente().getNumDocumento());
                if (cita.getPaciente().getPersona() != null) {
                    pacienteData.put("nombrePersona", cita.getPaciente().getPersona().getNombrePersona());
                    pacienteData.put("apellidoPersona", cita.getPaciente().getPersona().getApellidoPersona());
                }
                citaData.put("paciente", pacienteData);
            }

            return ResponseEntity.ok(citaData);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * POST - Crear nueva cita
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createCita(@RequestBody Map<String, Object> citaData) {
        try {
            Cita cita = new Cita();
            
            // Datos básicos
            if (citaData.containsKey("tiposervicio")) {
                cita.setTipoServicio(citaData.get("tiposervicio").toString());
            }
            if (citaData.containsKey("estado")) {
                cita.setEstado(citaData.get("estado").toString());
            }
            if (citaData.containsKey("fecha")) {
                cita.setFecha(java.time.LocalDate.parse(citaData.get("fecha").toString()));
            }
            if (citaData.containsKey("hora")) {
                cita.setHora(java.time.LocalTime.parse(citaData.get("hora").toString()));
            }

            // Asignar empleado (médico)
            if (citaData.containsKey("idempleado") && citaData.containsKey("numdocumentoempleado")) {
                Integer idEmpleado = Integer.parseInt(citaData.get("idempleado").toString());
                Integer numDocEmpleado = Integer.parseInt(citaData.get("numdocumentoempleado").toString());
                
                Empleado empleado = empleadoService.findById(
                    new com.gestion_medica.demo.model.keys.EmpleadoId(numDocEmpleado, idEmpleado)
                );
                
                if (empleado != null) {
                    cita.setEmpleado(empleado);
                }
            }

            // Asignar paciente (usando codPaciente y numDocumento)
            if (citaData.containsKey("codpaciente") && citaData.containsKey("numdocumento")) {
                Integer codPaciente = Integer.parseInt(citaData.get("codpaciente").toString());
                Integer numDocumento = Integer.parseInt(citaData.get("numdocumento").toString());
                
                Optional<Paciente> pacienteOpt = pacienteService.findById(
                    new com.gestion_medica.demo.model.keys.PacienteId(codPaciente, numDocumento)
                );
                
                if (pacienteOpt.isPresent()) {
                    cita.setPaciente(pacienteOpt.get());
                }
            }

            // Guardar la cita
            Cita savedCita = citaService.save(cita);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cita creada exitosamente");
            response.put("idcita", savedCita.getIdCita());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error al crear la cita: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * PUT - Actualizar cita existente
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateCita(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> citaData) {
        try {
            Optional<Cita> citaOpt = citaService.findById(id);
            
            if (citaOpt.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Cita no encontrada");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            Cita cita = citaOpt.get();

            // Actualizar datos básicos
            if (citaData.containsKey("tiposervicio")) {
                cita.setTipoServicio(citaData.get("tiposervicio").toString());
            }
            if (citaData.containsKey("estado")) {
                cita.setEstado(citaData.get("estado").toString());
            }
            if (citaData.containsKey("fecha")) {
                cita.setFecha(java.time.LocalDate.parse(citaData.get("fecha").toString()));
            }
            if (citaData.containsKey("hora")) {
                cita.setHora(java.time.LocalTime.parse(citaData.get("hora").toString()));
            }

            // Actualizar empleado si se proporciona
            if (citaData.containsKey("idempleado") && citaData.containsKey("numdocumentoempleado")) {
                Integer idEmpleado = Integer.parseInt(citaData.get("idempleado").toString());
                Integer numDocEmpleado = Integer.parseInt(citaData.get("numdocumentoempleado").toString());
                
                Empleado empleado = empleadoService.findById(
                    new com.gestion_medica.demo.model.keys.EmpleadoId(numDocEmpleado, idEmpleado)
                );
                
                if (empleado != null) {
                    cita.setEmpleado(empleado);
                }
            }

            // Actualizar paciente si se proporciona
            if (citaData.containsKey("codpaciente") && citaData.containsKey("numdocumento")) {
                Integer codPaciente = Integer.parseInt(citaData.get("codpaciente").toString());
                Integer numDocumento = Integer.parseInt(citaData.get("numdocumento").toString());
                
                Optional<Paciente> pacienteOpt = pacienteService.findById(
                    new com.gestion_medica.demo.model.keys.PacienteId(codPaciente, numDocumento)
                );
                
                if (pacienteOpt.isPresent()) {
                    cita.setPaciente(pacienteOpt.get());
                }
            }

            citaService.save(cita);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cita actualizada exitosamente");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error al actualizar la cita: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * DELETE - Eliminar cita
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteCita(@PathVariable Integer id) {
        try {
            Optional<Cita> citaOpt = citaService.findById(id);
            
            if (citaOpt.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Cita no encontrada");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            citaService.deleteById(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cita eliminada exitosamente");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error al eliminar la cita: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
