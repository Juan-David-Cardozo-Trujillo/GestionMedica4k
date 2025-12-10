package com.gestion_medica.demo.control;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gestion_medica.demo.model.HistoriaClinica;
import com.gestion_medica.demo.model.HistoriaClinicaRegistraDiagnostica;
import com.gestion_medica.demo.model.Paciente;
import com.gestion_medica.demo.model.keys.HistoriaClinicaRegistraDiagnosticaId;
import com.gestion_medica.demo.repository.HistoriaClinicaRegistraDiagnosticaRepository;
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
    private HistoriaClinicaRegistraDiagnosticaRepository registraDiagnosticaRepository;

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
            map.put("codPaciente", historia.getCodPaciente());
            map.put("numDocumento", historia.getNumDocumento());

            // Datos del paciente
            if (historia.getPaciente() != null) {
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
        response.put("codPaciente", historia.getCodPaciente());
        response.put("numDocumento", historia.getNumDocumento());

        // Datos del paciente
        if (historia.getPaciente() != null) {
            Map<String, Object> pacienteMap = new HashMap<>();
            Paciente paciente = historia.getPaciente();
            pacienteMap.put("codPaciente", paciente.getCodPaciente());
            pacienteMap.put("dirPaciente", paciente.getDirPaciente());
            
            if (paciente.getPersona() != null) {
                pacienteMap.put("nombrePersona", paciente.getPersona().getNombrePersona());
                pacienteMap.put("apellidoPersona", paciente.getPersona().getApellidoPersona());
                pacienteMap.put("numDocumento", paciente.getPersona().getNumDocumento());
                pacienteMap.put("fechaNacimiento", paciente.getPersona().getFechaNacimiento());
            }
            
            response.put("paciente", pacienteMap);
        }

        // Diagnósticos registrados
        List<Map<String, Object>> diagnosticos = new ArrayList<>();
        if (historia.getRegistroDiagnostica() != null) {
            for (HistoriaClinicaRegistraDiagnostica registro : historia.getRegistroDiagnostica()) {
                Map<String, Object> diagMap = new HashMap<>();
                diagMap.put("codHistoria", registro.getCodHistoria());
                diagMap.put("idEnfermedad", registro.getIdEnfermedad());
                diagMap.put("idCita", registro.getIdCita());
                diagMap.put("fechaRegistro", registro.getFechaRegistro());
                diagMap.put("horaRegistro", registro.getHoraRegistro());
                
                if (registro.getEnfermedad() != null) {
                    diagMap.put("nombreEnfermedad", registro.getEnfermedad().getNombreEnfermedad());
                }
                
                if (registro.getCita() != null) {
                    diagMap.put("idCita", registro.getCita().getIdCita());
                }
                
                diagnosticos.add(diagMap);
            }
        }
        response.put("diagnosticos", diagnosticos);

        return ResponseEntity.ok(response);
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
            historia.setCodPaciente(codPaciente);
            historia.setNumDocumento(numDocumento);
            historia.setPaciente(pacienteEncontrado);

            HistoriaClinica guardada = historiaRepository.save(historia);

            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("mensaje", "Historia clínica creada exitosamente");
            respuesta.put("codHistoria", guardada.getCodHistoria());
            respuesta.put("codPaciente", guardada.getCodPaciente());
            respuesta.put("numDocumento", guardada.getNumDocumento());

            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error al crear historia clínica: " + e.getMessage());
        }
    }

    /**
     * POST - Registrar un diagnóstico en la historia clínica
     */
    @PostMapping("/{codHistoria}/diagnosticos")
    public ResponseEntity<?> registrarDiagnostico(
            @PathVariable Integer codHistoria,
            @RequestBody Map<String, Object> payload) {
        try {
            Integer idEnfermedad = Integer.valueOf(payload.get("idEnfermedad").toString());
            Integer idCita = Integer.valueOf(payload.get("idCita").toString());
            LocalDate fechaRegistro = LocalDate.parse(payload.get("fechaRegistro").toString());
            LocalTime horaRegistro = LocalTime.parse(payload.get("horaRegistro").toString());

            // Verificar que la historia clínica existe
            Optional<HistoriaClinica> optHistoria = historiaRepository.findById(codHistoria);
            if (!optHistoria.isPresent()) {
                return ResponseEntity.badRequest().body("Historia clínica no encontrada");
            }

            // Crear el registro de diagnóstico
            HistoriaClinicaRegistraDiagnostica registro = new HistoriaClinicaRegistraDiagnostica();
            registro.setCodHistoria(codHistoria);
            registro.setIdEnfermedad(idEnfermedad);
            registro.setIdCita(idCita);
            registro.setFechaRegistro(fechaRegistro);
            registro.setHoraRegistro(horaRegistro);
            registro.setHistoriaClinica(optHistoria.get());

            HistoriaClinicaRegistraDiagnostica guardado = registraDiagnosticaRepository.save(registro);

            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("mensaje", "Diagnóstico registrado exitosamente");
            respuesta.put("codHistoria", guardado.getCodHistoria());
            respuesta.put("idEnfermedad", guardado.getIdEnfermedad());
            respuesta.put("idCita", guardado.getIdCita());
            respuesta.put("fechaRegistro", guardado.getFechaRegistro());
            respuesta.put("horaRegistro", guardado.getHoraRegistro());

            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error al registrar diagnóstico: " + e.getMessage());
        }
    }

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

    /**
     * DELETE - Eliminar un registro de diagnóstico
     */
    @DeleteMapping("/{codHistoria}/diagnosticos/{idEnfermedad}/{idCita}")
    public ResponseEntity<?> eliminarDiagnostico(
            @PathVariable Integer codHistoria,
            @PathVariable Integer idEnfermedad,
            @PathVariable Integer idCita) {
        try {
            HistoriaClinicaRegistraDiagnosticaId id = new HistoriaClinicaRegistraDiagnosticaId(
                    codHistoria, idEnfermedad, idCita);

            if (!registraDiagnosticaRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }

            registraDiagnosticaRepository.deleteById(id);
            return ResponseEntity.ok("Diagnóstico eliminado exitosamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al eliminar diagnóstico: " + e.getMessage());
        }
    }
}
