package com.gestion_medica.demo.service;

import com.gestion_medica.demo.model.Cita;
import com.gestion_medica.demo.repository.CitaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CitaService {

    @Autowired
    private CitaRepository repository;

    public List<Cita> findAll() {
        return repository.findAll();
    }

    public Optional<Cita> findById(Integer id) {
        return repository.findById(id);
    }

    public Cita save(Cita cita) {
        return repository.save(cita);
    }

    public void deleteById(Integer id) {
        repository.deleteById(id);
    }
}
