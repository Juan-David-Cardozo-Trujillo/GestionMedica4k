package com.gestion_medica.demo.control;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gestion_medica.demo.model.HistoriaClinica;
import com.gestion_medica.demo.model.Paciente;
import com.gestion_medica.demo.repository.HistoriaClinicaRepository;
import com.gestion_medica.demo.repository.PacienteRepository;

@RestController
@RequestMapping("/api/historias-clinicas")
public class HistoriaClinicaController {

    @Autowired
    private HistoriaClinicaRepository historiaRepository;

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private com.gestion_medica.demo.repository.CitaDiagnosticaEnfermedadRepository citaDiagnosticaRepository;

    @Autowired
    private com.gestion_medica.demo.repository.CitaPrescribeMedicamentoRepository prescribeMedicamentoRepository;

    /**
     * GET - Listar todas las historias clínicas
     */
    @GetMapping
    public List<Map<String, Object>> listar() {
        List<HistoriaClinica> historias = historiaRepository.findAll();
        List<Map<String, Object>> resultado = new ArrayList<>();

        for (HistoriaClinica historia : historias) {
            Map<String, Object> map = new HashMap<>();
            map.put("codHistoria", historia.getCodHistoria());

            // Datos del paciente
            if (historia.getPaciente() != null) {
                map.put("codPaciente", historia.getPaciente().getCodPaciente());
                map.put("numDocumento", historia.getPaciente().getNumDocumento());

                Map<String, Object> pacienteMap = new HashMap<>();
                pacienteMap.put("codPaciente", historia.getPaciente().getCodPaciente());
                
                // Datos de la persona del paciente
                if (historia.getPaciente().getPersona() != null) {
                    pacienteMap.put("nombrePersona", historia.getPaciente().getPersona().getNombrePersona());
                    pacienteMap.put("apellidoPersona", historia.getPaciente().getPersona().getApellidoPersona());
                    pacienteMap.put("numDocumento", historia.getPaciente().getPersona().getNumDocumento());
                    pacienteMap.put("fechaNacimiento", historia.getPaciente().getPersona().getFechaNacimiento());
                    pacienteMap.put("dirPaciente", historia.getPaciente().getDirPaciente());
                }
                
                map.put("paciente", pacienteMap);
            }

            resultado.add(map);
        }

        return resultado;
    }

    /**
     * GET - Obtener una historia clínica por ID con diagnósticos
     */
    @GetMapping("/{codHistoria}")
    public ResponseEntity<Map<String, Object>> obtenerDetalle(@PathVariable Integer codHistoria) {
        Optional<HistoriaClinica> optHistoria = historiaRepository.findById(codHistoria);

        if (!optHistoria.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        HistoriaClinica historia = optHistoria.get();
        Map<String, Object> response = new HashMap<>();

        // Datos básicos de la historia
        response.put("codHistoria", historia.getCodHistoria());

        Integer codPaciente = null;

        // Datos del paciente
        if (historia.getPaciente() != null) {
            Map<String, Object> pacienteMap = new HashMap<>();
            Paciente paciente = historia.getPaciente();
            codPaciente = paciente.getCodPaciente();
            
            pacienteMap.put("codPaciente", paciente.getCodPaciente());
            pacienteMap.put("dirPaciente", paciente.getDirPaciente());
            response.put("codPaciente", paciente.getCodPaciente());
            response.put("numDocumento", paciente.getNumDocumento());
            
            if (paciente.getPersona() != null) {
                pacienteMap.put("nombrePersona", paciente.getPersona().getNombrePersona());
                pacienteMap.put("apellidoPersona", paciente.getPersona().getApellidoPersona());
                pacienteMap.put("numDocumento", paciente.getPersona().getNumDocumento());
                pacienteMap.put("fechaNacimiento", paciente.getPersona().getFechaNacimiento());
            }
            
            response.put("paciente", pacienteMap);
        }

        // Diagnósticos registrados (NUEVO: Buscar por paciente a través de Citas)
        List<Map<String, Object>> diagnosticos = new ArrayList<>();
        if (codPaciente != null) {
            List<com.gestion_medica.demo.model.CitaDiagnosticaEnfermedad> registrosDiag = 
                citaDiagnosticaRepository.findByCitaPacienteCodPaciente(codPaciente);
            
            for (com.gestion_medica.demo.model.CitaDiagnosticaEnfermedad registro : registrosDiag) {
                Map<String, Object> diagMap = new HashMap<>();
                // diagMap.put("codHistoria", codHistoria); // Ya no aplica directamente
                diagMap.put("idEnfermedad", registro.getIdEnfermedad());
                diagMap.put("idCita", registro.getIdCita());
                // Fecha de la cita como fecha de diagnóstico
                if (registro.getCita() != null) {
                    diagMap.put("fechaRegistro", registro.getCita().getFecha());
                    diagMap.put("horaRegistro", registro.getCita().getHora());
                }
                
                if (registro.getEnfermedad() != null) {
                    diagMap.put("nombreEnfermedad", registro.getEnfermedad().getNombreEnfermedad());
                }
                
                diagnosticos.add(diagMap);
            }
        }
        
        response.put("diagnosticos", diagnosticos);

        // Medicamentos prescritos (NUEVO: Buscar por paciente a través de Citas)
        List<Map<String, Object>> medicamentos = new ArrayList<>();
        if (codPaciente != null) {
            List<com.gestion_medica.demo.model.CitaPrescribeMedicamento> registrosMed = 
                prescribeMedicamentoRepository.findByCitaPacienteCodPaciente(codPaciente);
            
            for (com.gestion_medica.demo.model.CitaPrescribeMedicamento reg : registrosMed) {
                Map<String, Object> medMap = new HashMap<>();
                medMap.put("idCita", reg.getIdCita());
                medMap.put("codMed", reg.getCodMed());
                medMap.put("dosis", reg.getDosis());
                medMap.put("frecuencia", reg.getFrecuencia());
                medMap.put("duracion", reg.getDuracion());
    
                if (reg.getMedicamento() != null) {
                    medMap.put("nombreMedicamento", reg.getMedicamento().getNombreMed());
                    medMap.put("descripcionMedicamento", reg.getMedicamento().getDescripcion());
                }
                if (reg.getCita() != null) {
                    medMap.put("fechaCita", reg.getCita().getFecha());
                }
                medicamentos.add(medMap);
            }
        }
        response.put("medicamentos", medicamentos);

        return ResponseEntity.ok(response);
    }

    /**
     * GET BY PACIENTE - Obtener historias verificando la relación
     */
    @GetMapping("/paciente/{codPaciente}")
    public ResponseEntity<Map<String, Object>> getHistoriaByPaciente(@PathVariable Integer codPaciente) {
        try {
            // Buscar todas las historias y filtrar (o usar un método de repositorio personalizado si existe)
            // Asumimos que un paciente tiene UNA sola historia clínica principal activa, o devolvemos todas
            List<HistoriaClinica> todas = historiaRepository.findAll();
            
            // Filtrar por paciente
            List<HistoriaClinica> historiasPaciente = new ArrayList<>();
            for (HistoriaClinica hc : todas) {
                if (hc.getPaciente() != null && hc.getPaciente().getCodPaciente().equals(codPaciente)) {
                    historiasPaciente.add(hc);
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            
            if (historiasPaciente.isEmpty()) {
                response.put("success", false);
                response.put("mensaje", "No se encontró historia clínica para este paciente");
                // Retornamos OK con success false para que el front no explote con 404
                return ResponseEntity.ok(response);
            }
            
            // Convertir a estructura de respuesta
            List<Map<String, Object>> historiasList = new ArrayList<>();
            
            for (HistoriaClinica h : historiasPaciente) {
                Map<String, Object> hMap = new HashMap<>();
                hMap.put("codHistoria", h.getCodHistoria());
                // hMap.put("fechaAtencion", h.getFechaAtencion() != null ? h.getFechaAtencion().toString() : null);
                // hMap.put("detalles", h.getDetalles());
                
                // Diagnósticos desde Citas
                List<com.gestion_medica.demo.model.CitaDiagnosticaEnfermedad> registrosDiag = 
                    citaDiagnosticaRepository.findByCitaPacienteCodPaciente(codPaciente);

                List<Map<String, Object>> diagnosticos = new ArrayList<>();
                for (com.gestion_medica.demo.model.CitaDiagnosticaEnfermedad registro : registrosDiag) {
                    Map<String, Object> diagMap = new HashMap<>();
                    if (registro.getEnfermedad() != null) {
                         diagMap.put("nombreEnfermedad", registro.getEnfermedad().getNombreEnfermedad());
                         diagMap.put("descripcionEnfermedad", registro.getEnfermedad().getDescripcionEnfermedad());
                    }
                    diagnosticos.add(diagMap);
                }
                hMap.put("diagnosticos", diagnosticos);

                // Medicamentos desde Citas (NUEVO)
                List<com.gestion_medica.demo.model.CitaPrescribeMedicamento> registrosMed = 
                    prescribeMedicamentoRepository.findByCitaPacienteCodPaciente(codPaciente);
                
                List<Map<String, Object>> medicamentos = new ArrayList<>();
                for (com.gestion_medica.demo.model.CitaPrescribeMedicamento reg : registrosMed) {
                    Map<String, Object> medMap = new HashMap<>();
                    medMap.put("dosis", reg.getDosis());
                    medMap.put("frecuencia", reg.getFrecuencia());
                    medMap.put("duracion", reg.getDuracion());
                    
                    if (reg.getMedicamento() != null) {
                        medMap.put("nombreMedicamento", reg.getMedicamento().getNombreMed());
                        medMap.put("descripcionMedicamento", reg.getMedicamento().getDescripcion());
                    }
                    if (reg.getCita() != null) {
                        medMap.put("fechaPrescripcion", reg.getCita().getFecha());
                    }
                    medicamentos.add(medMap);
                }
                hMap.put("medicamentos", medicamentos);
                
                historiasList.add(hMap);
            }
            
            response.put("success", true);
            response.put("historias", historiasList);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * POST - Crear nueva historia clínica
     */
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Map<String, Object> payload) {
        try {
            Integer codPaciente = Integer.valueOf(payload.get("codPaciente").toString());
            Integer numDocumento = Integer.valueOf(payload.get("numDocumento").toString());

            // Obtener el paciente por su código y número de documento
            List<Paciente> pacientes = pacienteRepository.findAll();
            Paciente pacienteEncontrado = pacientes.stream()
                .filter(p -> p.getCodPaciente().equals(codPaciente) && 
                           p.getNumDocumento().equals(numDocumento))
                .findFirst()
                .orElse(null);
            
            if (pacienteEncontrado == null) {
                return ResponseEntity.badRequest().body("Paciente no encontrado");
            }

            // Crear nueva historia clínica
            HistoriaClinica historia = new HistoriaClinica();
            // historia.setCodPaciente(codPaciente); // Eliminado
            // historia.setNumDocumento(numDocumento); // Eliminado
            historia.setPaciente(pacienteEncontrado);

            HistoriaClinica guardada = historiaRepository.save(historia);

            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("mensaje", "Historia clínica creada exitosamente");
            respuesta.put("codHistoria", guardada.getCodHistoria());
            respuesta.put("codPaciente", guardada.getPaciente().getCodPaciente());
            respuesta.put("numDocumento", guardada.getPaciente().getNumDocumento());

            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error al crear historia clínica: " + e.getMessage());
        }
    }

    // Metodos obsoletos de registro/eliminacion de diagnostico eliminados ya que ahora se gestionan desde citas.

    /**
     * DELETE - Eliminar una historia clínica
     */
    @DeleteMapping("/{codHistoria}")
    public ResponseEntity<?> eliminar(@PathVariable Integer codHistoria) {
        try {
            if (!historiaRepository.existsById(codHistoria)) {
                return ResponseEntity.notFound().build();
            }

            historiaRepository.deleteById(codHistoria);
            return ResponseEntity.ok("Historia clínica eliminada exitosamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al eliminar: " + e.getMessage());
        }
    }
}
