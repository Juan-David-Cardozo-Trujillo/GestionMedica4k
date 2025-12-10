package com.gestion_medica.demo.control;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.gestion_medica.demo.model.Medicamento;
import com.gestion_medica.demo.repository.MedicamentoRepository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/medicamentos")
public class MedicamentoController {

    @Autowired
    private MedicamentoRepository medicamentoRepository;

    @GetMapping
    public List<Medicamento> getAllMedicamentos() {
        return medicamentoRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Medicamento> getMedicamentoById(@PathVariable Integer id) {
        Optional<Medicamento> medicamento = medicamentoRepository.findById(id);
        return medicamento.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Medicamento> createMedicamento(@RequestBody Medicamento medicamento) {
        try {
            // Generar ID si es necesario (MAX + 1)
            if (medicamento.getCodMed() == null) {
                Integer maxId = medicamentoRepository.findAll().stream()
                    .mapToInt(Medicamento::getCodMed)
                    .max()
                    .orElse(0);
                medicamento.setCodMed(maxId + 1);
            }
            
            if (medicamentoRepository.existsById(medicamento.getCodMed())) {
                 return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
            
            Medicamento savedMedicamento = medicamentoRepository.save(medicamento);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedMedicamento);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Medicamento> updateMedicamento(@PathVariable Integer id, @RequestBody Medicamento medicamentoDetails) {
        Optional<Medicamento> medicamentoOptional = medicamentoRepository.findById(id);

        if (medicamentoOptional.isPresent()) {
            Medicamento medicamento = medicamentoOptional.get();
            medicamento.setNombreMed(medicamentoDetails.getNombreMed());
            medicamento.setDescripcion(medicamentoDetails.getDescripcion());
            medicamento.setUnidad(medicamentoDetails.getUnidad());
            medicamento.setStock(medicamentoDetails.getStock());
            medicamento.setProveedor(medicamentoDetails.getProveedor());

            Medicamento updatedMedicamento = medicamentoRepository.save(medicamento);
            return ResponseEntity.ok(updatedMedicamento);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedicamento(@PathVariable Integer id) {
        if (medicamentoRepository.existsById(id)) {
            medicamentoRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
