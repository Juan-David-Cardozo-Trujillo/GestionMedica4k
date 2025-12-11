package com.gestion_medica.demo.control;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gestion_medica.demo.model.ReporteMedico;
import com.gestion_medica.demo.repository.ReporteMedicoRepository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReporteMedicoRepository reporteRepository;

    @Autowired
    private EntityManager entityManager;

    // CONSULTA 1: Medicamentos más recetados por sede
    @GetMapping("/medicamentos-top-sede")
    public ResponseEntity<?> getMedicamentosTopSede() {
        try {
            String sql = "SELECT nombreSede, nombreMed, total_recetas FROM Med_Por_Sedes NATURAL JOIN Max_Medicamento_Sedes WHERE total_recetas = max_recetas";
            Query query = entityManager.createNativeQuery(sql);
            List<Object[]> results = query.getResultList();
            
            List<Map<String, Object>> mappedResults = new ArrayList<>();
            for (Object[] row : results) {
                Map<String, Object> item = new HashMap<>();
                item.put("nombreSede", row[0]);
                item.put("nombreMed", row[1]);
                item.put("totalRecetas", row[2]);
                mappedResults.add(item);
            }
            return ResponseEntity.ok(mappedResults);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al ejecutar reporte: " + e.getMessage());
        }
    }

    // CONSULTA 2: Médicos con más consultas por semana
    @GetMapping("/medicos-top-semana")
    public ResponseEntity<?> getMedicosTopSemana() {
        try {
            String sql = "SELECT nombrePersona, apellidoPersona, semana, total_consultas FROM num_consultas_semana NATURAL JOIN max_consultas_semanas WHERE total_consultas = record_consultas ORDER BY semana DESC";
            Query query = entityManager.createNativeQuery(sql);
            List<Object[]> results = query.getResultList();
            
            List<Map<String, Object>> mappedResults = new ArrayList<>();
            for (Object[] row : results) {
                Map<String, Object> item = new HashMap<>();
                item.put("nombrePersona", row[0]);
                item.put("apellidoPersona", row[1]);
                item.put("semana", row[2]);
                item.put("totalConsultas", row[3]);
                mappedResults.add(item);
            }
            return ResponseEntity.ok(mappedResults);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al ejecutar reporte: " + e.getMessage());
        }
    }

    // CONSULTA 3: Tiempo promedio entre cita y diagnóstico
    @GetMapping("/tiempo-promedio")
    public ResponseEntity<?> getTiempoPromedio() {
        try {
            // Updated to match user's DB schema: view 'duracion_citas'
            // We convert the interval average to days (float) for the frontend
            String sql = "SELECT EXTRACT(EPOCH FROM AVG(duracion)) / 86400.0 FROM duracion_citas";
            Query query = entityManager.createNativeQuery(sql);
            List<?> results = query.getResultList();
            
            Object result = 0;
            if (!results.isEmpty() && results.get(0) != null) {
                result = results.get(0);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("promedio_duracion", result);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al ejecutar reporte: " + e.getMessage());
        }
    }

    // CONSULTA 4: Auditoría Historias Clínicas
    @GetMapping("/auditoria-historias")
    public ResponseEntity<?> getAuditoriaHistorias() {
        try {
            String sql = "SELECT idEvento, fechaEvento, accion, nombreUsuario FROM vista_auditoria WHERE tablaAfectada = 'historias_clinicas' ORDER BY fechaEvento DESC LIMIT 20";
            Query query = entityManager.createNativeQuery(sql);
            List<Object[]> results = query.getResultList();
            
            List<Map<String, Object>> mappedResults = new ArrayList<>();
            for (Object[] row : results) {
                Map<String, Object> item = new HashMap<>();
                item.put("idEvento", row[0]);
                item.put("fechaEvento", row[1]);
                item.put("accion", row[2]);
                item.put("nombreUsuario", row[3]);
                mappedResults.add(item);
            }
            return ResponseEntity.ok(mappedResults);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al ejecutar reporte: " + e.getMessage());
        }
    }

    // CONSULTA 5: Equipamiento compartido
    @GetMapping("/equipamiento-compartido")
    public ResponseEntity<?> getEquipamientoCompartido() {
        try {
           String sql = "SELECT idSede, nombreDepartamento, codEquip, nombreEquip FROM equip_por_dept_sedes WHERE codEquip IN (SELECT codEquip FROM equip_por_dept_sedes GROUP BY codEquip HAVING COUNT(DISTINCT idSede) > 1)";
            Query query = entityManager.createNativeQuery(sql);
            List<Object[]> results = query.getResultList();
            
            List<Map<String, Object>> mappedResults = new ArrayList<>();
            for (Object[] row : results) {
                Map<String, Object> item = new HashMap<>();
                item.put("idSede", row[0]);
                item.put("nombreDepartamento", row[1]);
                item.put("codEquip", row[2]);
                item.put("nombreEquip", row[3]);
                mappedResults.add(item);
            }
            return ResponseEntity.ok(mappedResults);
        } catch (Exception e) {
             return ResponseEntity.internalServerError().body("Error al ejecutar reporte: " + e.getMessage());
        }
    }

     // CONSULTA 6: Enfermedades por sede
    @GetMapping("/enfermedades-sede")
    public ResponseEntity<?> getEnfermedadesSede() {
        try {
            String sql = "SELECT nombreSede, nombreEnfermedad, total_pacientes FROM pacientesenfermedadsede";
            Query query = entityManager.createNativeQuery(sql);
            List<Object[]> results = query.getResultList();
            
            List<Map<String, Object>> mappedResults = new ArrayList<>();
            for (Object[] row : results) {
                Map<String, Object> item = new HashMap<>();
                item.put("nombreSede", row[0]);
                item.put("nombreEnfermedad", row[1]);
                item.put("totalPacientes", row[2]);
                mappedResults.add(item);
            }
            return ResponseEntity.ok(mappedResults);
        } catch (Exception e) {
             return ResponseEntity.internalServerError().body("Error al ejecutar reporte: " + e.getMessage());
        }
    }
    // CREAR REPORTE MANUAL
    @PostMapping("/create")
    public ResponseEntity<?> createReport(@RequestBody ReporteMedico reporte) {
        try {
            System.out.println("Recibiendo reporte: " + reporte);
            if (reporte.getFechaGeneracion() == null) {
                reporte.setFechaGeneracion(java.time.LocalDate.now());
            }
            ReporteMedico savedReport = reporteRepository.save(reporte);
            
            // Retornar mapa simple para evitar problemas de serialización
            Map<String, Object> response = new HashMap<>();
            response.put("idReporte", savedReport.getIdReporte());
            response.put("mensaje", "Reporte creado exitosamente");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error al crear reporte: " + e.getMessage());
        }
    }
}
