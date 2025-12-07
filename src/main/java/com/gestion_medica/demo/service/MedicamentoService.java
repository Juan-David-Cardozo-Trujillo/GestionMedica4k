package com.gestion_medica.demo.service;

import com.gestion_medica.demo.model.Medicamento;
import com.gestion_medica.demo.repository.MedicamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class MedicamentoService {

    @Autowired
    private MedicamentoRepository repository;

    public List<Medicamento> findAll() {
        return repository.findAll();
    }

    public Optional<Medicamento> findById(Integer id) {
        return repository.findById(id);
    }

    public Medicamento save(Medicamento medicamento) {
        return repository.save(medicamento);
    }

    public void deleteById(Integer id) {
        repository.deleteById(id);
    }
}
