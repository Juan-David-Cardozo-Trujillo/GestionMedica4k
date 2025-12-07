package com.gestion_medica.demo.repository;

import com.gestion_medica.demo.model.PacienteAsisteSede;
import com.gestion_medica.demo.model.keys.PacienteAsisteSedeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;


@Repository
public interface PacienteAsisteSedeRepository extends JpaRepository<PacienteAsisteSede, PacienteAsisteSedeId> {
}
