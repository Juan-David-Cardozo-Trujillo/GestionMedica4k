package com.gestion_medica.demo.control;

import com.gestion_medica.demo.model.SedeHospitalaria;
import com.gestion_medica.demo.repository.SedeHospitalariaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sedes")
public class SedeController {

    @Autowired
    private SedeHospitalariaRepository sedeRepository;

    /**
     * GET - Listar todas las sedes CORREGIDO: Devuelve camelCase para
     * consistencia
     */
    @GetMapping
    public List<Map<String, Object>> listar() {
        List<SedeHospitalaria> sedes = sedeRepository.findAll();
        List<Map<String, Object>> response = new ArrayList<>();

        for (SedeHospitalaria sede : sedes) {
            Map<String, Object> sedeData = new HashMap<>();
            // ✅ CORRECCIÓN: Usar camelCase consistente
            sedeData.put("idSede", sede.getIdSede());
            sedeData.put("nombreSede", sede.getNombreSede());
            response.add(sedeData);
        }

        return response;
    }

    /**
     * GET - Obtener sede por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> obtenerPorId(@PathVariable Integer id) {
        return sedeRepository.findById(id)
                .map(sede -> {
                    Map<String, Object> sedeData = new HashMap<>();
                    sedeData.put("idSede", sede.getIdSede());
                    sedeData.put("nombreSede", sede.getNombreSede());
                    return ResponseEntity.ok(sedeData);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * PUT - Actualizar sede existente
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> actualizar(
            @PathVariable Integer id,
            @RequestBody SedeHospitalaria sedeActualizada) {

        Map<String, Object> response = new HashMap<>();

        try {
            // Verificar que la sede existe
            SedeHospitalaria sedeExistente = sedeRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Sede no encontrada"));

            // Actualizar solo el nombre
            sedeExistente.setNombreSede(sedeActualizada.getNombreSede());

            // Guardar cambios
            SedeHospitalaria sedeGuardada = sedeRepository.save(sedeExistente);

            response.put("success", true);
            response.put("mensaje", "Sede actualizada correctamente");
            response.put("idSede", sedeGuardada.getIdSede());
            response.put("nombreSede", sedeGuardada.getNombreSede());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("mensaje", "Error al actualizar sede: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
