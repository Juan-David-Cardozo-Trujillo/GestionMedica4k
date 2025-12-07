package com.gestion_medica.demo.repository;

import com.gestion_medica.demo.model.CitaDiagnosticaEnfermedad;
import com.gestion_medica.demo.model.keys.CitaDiagnosticaEnfermedadId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CitaDiagnosticaEnfermedadRepository extends JpaRepository<CitaDiagnosticaEnfermedad, CitaDiagnosticaEnfermedadId> {
}
