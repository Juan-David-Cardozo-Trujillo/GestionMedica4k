package com.gestion_medica.demo.repository;

import com.gestion_medica.demo.model.EquipamientoUsaDepartamento;
import com.gestion_medica.demo.model.keys.EquipamientoUsaDepartamentoId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;


@Repository
public interface EquipamientoUsaDepartamentoRepository extends JpaRepository<EquipamientoUsaDepartamento, EquipamientoUsaDepartamentoId> {
}
