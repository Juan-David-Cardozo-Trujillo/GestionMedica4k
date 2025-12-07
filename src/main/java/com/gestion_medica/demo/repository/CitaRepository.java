package com.gestion_medica.demo.repository;

import com.gestion_medica.demo.model.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;



@Repository
public interface CitaRepository extends JpaRepository<Cita, Integer> {
}
