package com.gestion_medica.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.gestion_medica.demo.model.ReporteMedico;

public interface ReporteMedicoRepository extends JpaRepository<ReporteMedico, Integer> {
}
