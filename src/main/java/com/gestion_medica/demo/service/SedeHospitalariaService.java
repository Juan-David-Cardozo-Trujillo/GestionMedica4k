package com.gestion_medica.demo.service;

import com.gestion_medica.demo.model.SedeHospitalaria;
import com.gestion_medica.demo.repository.SedeHospitalariaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class SedeHospitalariaService {

    @Autowired
    private SedeHospitalariaRepository repository;

    public List<SedeHospitalaria> findAll() {
        return repository.findAll();
    }

    public Optional<SedeHospitalaria> findById(Integer id) {
        return repository.findById(id);
    }

    public SedeHospitalaria save(SedeHospitalaria sede) {
        return repository.save(sede);
    }

    public void deleteById(Integer id) {
        repository.deleteById(id);
    }
}
