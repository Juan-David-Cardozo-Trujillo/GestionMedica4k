package com.gestion_medica.demo.repository;

import com.gestion_medica.demo.model.SedeHospitalaria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;


@Repository
public interface SedeHospitalariaRepository extends JpaRepository<SedeHospitalaria, Integer> {
}
