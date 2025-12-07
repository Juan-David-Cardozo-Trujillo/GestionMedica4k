package com.gestion_medica.demo.repository;

import com.gestion_medica.demo.model.Empleado;
import com.gestion_medica.demo.model.keys.EmpleadoId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;


@Repository
public interface EmpleadoRepository extends JpaRepository<Empleado, EmpleadoId> {
}
