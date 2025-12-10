package com.gestion_medica.demo.Control;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gestion_medica.demo.model.Cita;
import com.gestion_medica.demo.model.HistoriaClinica;
import com.gestion_medica.demo.model.Paciente;
import com.gestion_medica.demo.repository.CitaRepository;
import com.gestion_medica.demo.repository.HistoriaClinicaRepository;
import com.gestion_medica.demo.repository.PacienteRepository;

@RestController
@RequestMapping("/api/paciente")
public class PacienteController {

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private CitaRepository citaRepository;

    @Autowired
    private HistoriaClinicaRepository historiaClinicaRepository;

    /**
     * Obtener información del paciente por número de documento
     */
    @GetMapping("/info/{numDocumento}")
    public ResponseEntity<Map<String, Object>> getInfoPaciente(@PathVariable Integer numDocumento) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Paciente paciente = pacienteRepository.findByNumDocumento(numDocumento);
            
            if (paciente == null) {
                response.put("success", false);
                response.put("mensaje", "Paciente no encontrado");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
            response.put("success", true);
            response.put("paciente", paciente);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("mensaje", "Error al obtener información del paciente: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Obtener todas las citas próximas del paciente (estado: Programada)
     */
    @GetMapping("/citas/proximas/{codPaciente}")
    public ResponseEntity<Map<String, Object>> getCitasProximas(@PathVariable Integer codPaciente) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Cita> citas = citaRepository.findCitasProximasByPaciente(codPaciente);
            
            response.put("success", true);
            response.put("citas", citas);
            response.put("total", citas.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("mensaje", "Error al obtener citas próximas: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Obtener historial de citas del paciente (Completadas o Canceladas)
     */
    @GetMapping("/citas/historial/{codPaciente}")
    public ResponseEntity<Map<String, Object>> getHistorialCitas(@PathVariable Integer codPaciente) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Cita> citas = citaRepository.findHistorialCitasByPaciente(codPaciente);
            
            response.put("success", true);
            response.put("citas", citas);
            response.put("total", citas.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("mensaje", "Error al obtener historial de citas: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Obtener todas las citas del paciente
     */
    @GetMapping("/citas/{codPaciente}")
    public ResponseEntity<Map<String, Object>> getAllCitas(@PathVariable Integer codPaciente) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Cita> citas = citaRepository.findByPaciente(codPaciente);
            
            response.put("success", true);
            response.put("citas", citas);
            response.put("total", citas.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("mensaje", "Error al obtener citas: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Obtener historia clínica del paciente
     */
    @GetMapping("/historia-clinica/{codPaciente}")
    public ResponseEntity<Map<String, Object>> getHistoriaClinica(@PathVariable Integer codPaciente) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<HistoriaClinica> historias = historiaClinicaRepository.findByCodPaciente(codPaciente);
            
            response.put("success", true);
            response.put("historias", historias);
            response.put("total", historias.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("mensaje", "Error al obtener historia clínica: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
