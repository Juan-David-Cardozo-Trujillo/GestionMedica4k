package com.gestion_medica.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gestion_medica.demo.model.CitaPrescribeMedicamento;
import com.gestion_medica.demo.model.keys.CitaPrescribeMedicamentoId;

@Repository
public interface CitaPrescribeMedicamentoRepository extends JpaRepository<CitaPrescribeMedicamento, CitaPrescribeMedicamentoId> {
    
    java.util.List<CitaPrescribeMedicamento> findByHistoriaClinicaCodHistoria(Integer codHistoria);
    java.util.List<CitaPrescribeMedicamento> findByCitaPacienteCodPaciente(Integer codPaciente);
}
