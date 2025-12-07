package com.gestion_medica.demo.repository;

import com.gestion_medica.demo.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;


@Repository
public interface MedicamentoRepository extends JpaRepository<Medicamento, Integer> {
}
