package com.gestion_medica.demo.repository;

import com.gestion_medica.demo.model.AuditoriaAcceso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditoriaAccesoRepository extends JpaRepository<AuditoriaAcceso, Integer> {
}
