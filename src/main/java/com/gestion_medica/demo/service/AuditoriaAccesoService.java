package com.gestion_medica.demo.service;

import com.gestion_medica.demo.model.AuditoriaAcceso;
import com.gestion_medica.demo.repository.AuditoriaAccesoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AuditoriaAccesoService {

    @Autowired
    private AuditoriaAccesoRepository repository;

    public List<AuditoriaAcceso> findAll() {
        return repository.findAll();
    }

    public Optional<AuditoriaAcceso> findById(Integer id) {
        return repository.findById(id);
    }

    public AuditoriaAcceso save(AuditoriaAcceso auditoria) {
        return repository.save(auditoria);
    }

    public void deleteById(Integer id) {
        repository.deleteById(id);
    }
}
