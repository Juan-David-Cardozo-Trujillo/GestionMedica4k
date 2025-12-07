package com.gestion_medica.demo.service;

import com.gestion_medica.demo.model.Departamento;
import com.gestion_medica.demo.model.keys.DepartamentoId;
import com.gestion_medica.demo.repository.DepartamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class DepartamentoService {

    @Autowired
    private DepartamentoRepository repository;

    public List<Departamento> findAll() {
        return repository.findAll();
    }

    public Optional<Departamento> findById(DepartamentoId id) {
        return repository.findById(id);
    }

    public Departamento save(Departamento departamento) {
        return repository.save(departamento);
    }

    public void deleteById(DepartamentoId id) {
        repository.deleteById(id);
    }
}
