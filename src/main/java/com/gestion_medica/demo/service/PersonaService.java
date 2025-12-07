package com.gestion_medica.demo.service;

import com.gestion_medica.demo.model.Persona;
import com.gestion_medica.demo.repository.PersonaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PersonaService {

    @Autowired
    private PersonaRepository repository;

    public List<Persona> findAll() {
        return repository.findAll();
    }

    public Optional<Persona> findById(Integer id) {
        return repository.findById(id);
    }

    public Persona save(Persona persona) {
        return repository.save(persona);
    }

    public void deleteById(Integer id) {
        repository.deleteById(id);
    }
}
