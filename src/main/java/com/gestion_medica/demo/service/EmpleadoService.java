package com.gestion_medica.demo.service;

import com.gestion_medica.demo.model.Empleado;
import com.gestion_medica.demo.model.keys.EmpleadoId;
import com.gestion_medica.demo.repository.EmpleadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class EmpleadoService {

    @Autowired
    private EmpleadoRepository repository;

    public List<Empleado> findAll() {
        return repository.findAll();
    }

    public Optional<Empleado> findById(EmpleadoId id) {
        return repository.findById(id);
    }

    public Empleado save(Empleado empleado) {
        return repository.save(empleado);
    }

    public void deleteById(EmpleadoId id) {
        repository.deleteById(id);
    }
}
