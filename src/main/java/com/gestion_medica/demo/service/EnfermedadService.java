package com.gestion_medica.demo.service;

import com.gestion_medica.demo.model.Enfermedad;
import com.gestion_medica.demo.repository.EnfermedadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class EnfermedadService {

    @Autowired
    private EnfermedadRepository repository;

    public List<Enfermedad> findAll() {
        return repository.findAll();
    }

    public Optional<Enfermedad> findById(Integer id) {
        return repository.findById(id);
    }

    public Enfermedad save(Enfermedad enfermedad) {
        return repository.save(enfermedad);
    }

    public void deleteById(Integer id) {
        repository.deleteById(id);
    }
}
