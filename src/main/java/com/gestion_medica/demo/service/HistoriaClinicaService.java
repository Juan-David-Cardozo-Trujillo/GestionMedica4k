package com.gestion_medica.demo.service;

import com.gestion_medica.demo.model.HistoriaClinica;
import com.gestion_medica.demo.repository.HistoriaClinicaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class HistoriaClinicaService {

    @Autowired
    private HistoriaClinicaRepository repository;

    public List<HistoriaClinica> findAll() {
        return repository.findAll();
    }

    public Optional<HistoriaClinica> findById(Integer id) {
        return repository.findById(id);
    }

    public HistoriaClinica save(HistoriaClinica historia) {
        return repository.save(historia);
    }

    public void deleteById(Integer id) {
        repository.deleteById(id);
    }
}
