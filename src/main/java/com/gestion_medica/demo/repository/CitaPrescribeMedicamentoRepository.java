package com.gestion_medica.demo.repository;

import com.gestion_medica.demo.model.CitaPrescribeMedicamento;
import com.gestion_medica.demo.model.keys.CitaPrescribeMedicamentoId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CitaPrescribeMedicamentoRepository extends JpaRepository<CitaPrescribeMedicamento, CitaPrescribeMedicamentoId> {
}
