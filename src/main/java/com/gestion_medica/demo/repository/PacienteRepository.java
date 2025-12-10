package com.gestion_medica.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gestion_medica.demo.model.Paciente;
import com.gestion_medica.demo.model.keys.PacienteId;


@Repository
public interface PacienteRepository extends JpaRepository<Paciente, PacienteId> {
    
    // Buscar paciente por número de documento
    Paciente findByNumDocumento(Integer numDocumento);
}
