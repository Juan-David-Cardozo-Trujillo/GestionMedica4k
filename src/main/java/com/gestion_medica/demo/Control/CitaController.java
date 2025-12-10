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

import com.gestion_medica.demo.model.Cita;
import com.gestion_medica.demo.model.Empleado;
import com.gestion_medica.demo.model.Paciente;
import com.gestion_medica.demo.repository.EmpleadoRepository;
import com.gestion_medica.demo.service.CitaService;
import com.gestion_medica.demo.service.EmpleadoService;
import com.gestion_medica.demo.service.PacienteService;

@RestController
@RequestMapping("/api/citas")
public class CitaController {

    @Autowired
    private CitaService citaService;

    @Autowired
    private EmpleadoService empleadoService;
    
    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private PacienteService pacienteService;

    @Autowired
    private com.gestion_medica.demo.repository.CitaDiagnosticaEnfermedadRepository citaDiagnosticaEnfermedadRepository;
    
    @Autowired
    private com.gestion_medica.demo.repository.CitaPrescribeMedicamentoRepository citaPrescribeMedicamentoRepository;
    
    @Autowired
    private com.gestion_medica.demo.repository.EnfermedadRepository enfermedadRepository;
    
    @Autowired
    private com.gestion_medica.demo.repository.MedicamentoRepository medicamentoRepository;
    
    @Autowired
    private com.gestion_medica.demo.repository.HistoriaClinicaRepository historiaClinicaRepository;

    /**
     * GET ALL - Listar todas las citas, opcionalmente filtradas por médico
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllCitas(@org.springframework.web.bind.annotation.RequestParam(required = false) Integer idEmpleado) {
        try {
            List<Cita> citas;
            if (idEmpleado != null) {
                citas = citaService.findByEmpleadoId(idEmpleado);
            } else {
                citas = citaService.findAll();
            }

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
    /**
     * POST - Registrar diagnóstico en una cita
     */
    @PostMapping("/{idCita}/diagnostico")
    public ResponseEntity<Map<String, Object>> registrarDiagnostico(
            @PathVariable Integer idCita,
            @RequestBody Map<String, Object> payload) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Integer idEnfermedad = Integer.parseInt(payload.get("idEnfermedad").toString());
            
            // Verificar existencia
            Optional<Cita> citaOpt = citaService.findById(idCita);
            if (citaOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "Cita no encontrada");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
            // Verificar enfermedad (opcional pero recomendado)
            if (!enfermedadRepository.existsById(idEnfermedad)) {
                response.put("success", false);
                response.put("message", "Enfermedad no encontrada");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
            // Crear registro
            com.gestion_medica.demo.model.CitaDiagnosticaEnfermedad registro = new com.gestion_medica.demo.model.CitaDiagnosticaEnfermedad();
            registro.setIdCita(idCita);
            registro.setIdEnfermedad(idEnfermedad);
            
            citaDiagnosticaEnfermedadRepository.save(registro);
            
            // Actualizar estado de la cita a "Tomada"
            Cita cita = citaOpt.get();
            cita.setEstado("Tomada");
            citaService.save(cita);
            
            response.put("success", true);
            response.put("message", "Diagnóstico registrado exitosamente");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Error al registrar diagnóstico: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    /**
     * POST - Registrar prescripción para una cita
     */
    @PostMapping("/{idCita}/prescripcion")
    public ResponseEntity<Map<String, Object>> registrarPrescripcion(
            @PathVariable Integer idCita,
            @RequestBody Map<String, Object> payload) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Integer codMed = Integer.parseInt(payload.get("codMed").toString());
            String dosis = payload.get("dosis").toString();
            String frecuencia = payload.get("frecuencia").toString();
            String duracion = payload.get("duracion").toString();
            
            // Verificar Cita
            Optional<Cita> citaOpt = citaService.findById(idCita);
            if (!citaOpt.isPresent()) {
                response.put("success", false);
                response.put("message", "Cita no encontrada");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            Cita cita = citaOpt.get();
            
            // Verificar Medicamento
            if (!medicamentoRepository.existsById(codMed)) {
                response.put("success", false);
                response.put("message", "Medicamento no encontrado");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
            // Buscar Historia Clínica del Paciente
            if (cita.getPaciente() == null) {
                response.put("success", false);
                response.put("message", "La cita no tiene paciente asociado");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            Optional<com.gestion_medica.demo.model.HistoriaClinica> historiaOpt = 
                historiaClinicaRepository.findByPacienteCodPaciente(cita.getPaciente().getCodPaciente());
                
            if (!historiaOpt.isPresent()) {
                response.put("success", false);
                // Intentar buscar historia por create-on-demand si no existe?
                // Por ahora retornamos error, ya que debería existir
                response.put("message", "El paciente no tiene historia clínica (asegúrese de crearla primero)");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
            // Verificar si ya existe prescripción para evitar 500
            com.gestion_medica.demo.model.keys.CitaPrescribeMedicamentoId id = 
                new com.gestion_medica.demo.model.keys.CitaPrescribeMedicamentoId(idCita, codMed);
                
            if (citaPrescribeMedicamentoRepository.existsById(id)) {
                // Actualizar existente o retornar error?
                // Vamos a borrar el anterior y crear el nuevo para actualizar
                citaPrescribeMedicamentoRepository.deleteById(id);
            }
            
            // Crear Prescripción
            com.gestion_medica.demo.model.CitaPrescribeMedicamento prescripcion = new com.gestion_medica.demo.model.CitaPrescribeMedicamento();
            prescripcion.setIdCita(idCita);
            prescripcion.setCodMed(codMed);
            prescripcion.setHistoriaClinica(historiaOpt.get());
            prescripcion.setDosis(dosis);
            prescripcion.setFrecuencia(frecuencia);
            prescripcion.setDuracion(duracion);
            prescripcion.setFechaEmision(java.time.LocalDate.now());
            
            citaPrescribeMedicamentoRepository.save(prescripcion);
            
            // Asegurar que la cita quede marcada como "Tomada" si no lo estaba
            if (!"Tomada".equals(cita.getEstado())) {
                cita.setEstado("Tomada");
                citaService.save(cita);
            }
            
            response.put("success", true);
            response.put("message", "Prescripción registrada exitosamente");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Error al registrar prescripción: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
