package com.gestion_medica.demo.repository;

import com.gestion_medica.demo.model.Paciente;
import com.gestion_medica.demo.model.keys.PacienteId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;


@Repository
public interface PacienteRepository extends JpaRepository<Paciente, PacienteId> {
}
