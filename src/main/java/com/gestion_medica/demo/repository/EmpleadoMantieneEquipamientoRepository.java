package com.gestion_medica.demo.repository;

import com.gestion_medica.demo.model.EmpleadoMantieneEquipamiento;
import com.gestion_medica.demo.model.keys.EmpleadoMantieneEquipamientoId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;


@Repository
public interface EmpleadoMantieneEquipamientoRepository extends JpaRepository<EmpleadoMantieneEquipamiento, EmpleadoMantieneEquipamientoId> {
}
