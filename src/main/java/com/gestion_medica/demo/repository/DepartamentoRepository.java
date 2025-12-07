package com.gestion_medica.demo.repository;

import com.gestion_medica.demo.model.Departamento;
import com.gestion_medica.demo.model.keys.DepartamentoId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface DepartamentoRepository extends JpaRepository<Departamento, DepartamentoId> {
}
