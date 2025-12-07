package com.gestion_medica.demo.service;

import com.gestion_medica.demo.model.Equipamiento;
import com.gestion_medica.demo.repository.EquipamientoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class EquipamientoService {

    @Autowired
    private EquipamientoRepository repository;

    public List<Equipamiento> findAll() {
        return repository.findAll();
    }

    public Optional<Equipamiento> findById(Integer id) {
        return repository.findById(id);
    }

    public Equipamiento save(Equipamiento equipamiento) {
        return repository.save(equipamiento);
    }

    public void deleteById(Integer id) {
        repository.deleteById(id);
    }
}
