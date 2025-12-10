package com.gestion_medica.demo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gestion_medica.demo.model.Empleado;
import com.gestion_medica.demo.model.keys.EmpleadoId;


@Repository
public interface EmpleadoRepository extends JpaRepository<Empleado, EmpleadoId> {
    
    // Buscar empleado por idEmpleado únicamente
    Optional<Empleado> findByIdEmpleado(Integer idEmpleado);

    // Buscar empleado por número de documento (Relación con Persona/Usuario)
    Optional<Empleado> findByNumDocumento(Integer numDocumento);
}
