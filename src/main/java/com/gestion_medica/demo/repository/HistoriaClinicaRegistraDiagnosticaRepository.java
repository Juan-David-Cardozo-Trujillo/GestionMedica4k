package com.gestion_medica.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gestion_medica.demo.model.HistoriaClinicaRegistraDiagnostica;
import com.gestion_medica.demo.model.keys.HistoriaClinicaRegistraDiagnosticaId;

@Repository
public interface HistoriaClinicaRegistraDiagnosticaRepository extends JpaRepository<HistoriaClinicaRegistraDiagnostica, HistoriaClinicaRegistraDiagnosticaId> {
    // Métodos personalizados si son necesarios
}
