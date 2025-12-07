package com.gestion_medica.demo.repository;

import com.gestion_medica.demo.model.HistoriaClinicaRegistraDiagnostica;
import com.gestion_medica.demo.model.keys.HistoriaClinicaRegistraDiagnosticaId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;


@Repository
public interface HistoriaClinicaRegistraDiagnosticaRepository extends JpaRepository<HistoriaClinicaRegistraDiagnostica, HistoriaClinicaRegistraDiagnosticaId> {
}
