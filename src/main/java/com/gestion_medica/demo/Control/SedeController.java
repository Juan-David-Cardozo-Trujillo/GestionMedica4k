package com.gestion_medica.demo.control;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gestion_medica.demo.model.SedeHospitalaria;
import com.gestion_medica.demo.repository.SedeHospitalariaRepository;

@RestController
@RequestMapping("/api/sedes")
public class SedeController {

    @Autowired
    private SedeHospitalariaRepository sedeRepository;

    @GetMapping
    public List<SedeHospitalaria> listar() {
        return sedeRepository.findAll();
    }
}
