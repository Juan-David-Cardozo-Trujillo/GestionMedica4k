package com.gestion_medica.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gestion_medica.demo.model.HistoriaClinica;

@Repository
public interface HistoriaClinicaRepository extends JpaRepository<HistoriaClinica, Integer> {
    
    // Buscar historia clínica por código de paciente
    List<HistoriaClinica> findByCodPaciente(Integer codPaciente);
}
