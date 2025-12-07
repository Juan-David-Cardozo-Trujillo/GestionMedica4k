package com.gestion_medica.demo.repository;

import com.gestion_medica.demo.model.ReporteMedico;
import com.gestion_medica.demo.model.keys.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;


@Repository
public interface ReporteMedicoRepository extends JpaRepository<ReporteMedico, Integer> {
}
