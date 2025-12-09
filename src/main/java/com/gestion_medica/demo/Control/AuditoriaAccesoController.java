package com.gestion_medica.demo.control;

import com.gestion_medica.demo.model.AuditoriaAcceso;
import com.gestion_medica.demo.service.AuditoriaAccesoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/auditoria")
public class AuditoriaAccesoController {

    @Autowired
    private AuditoriaAccesoService auditoriaService;

    @GetMapping
    public List<AuditoriaAcceso> listar() {
        return auditoriaService.findAll();
    }
}
