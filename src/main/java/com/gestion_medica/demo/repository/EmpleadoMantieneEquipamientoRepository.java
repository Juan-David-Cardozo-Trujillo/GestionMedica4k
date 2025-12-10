package com.gestion_medica.demo.repository;

import com.gestion_medica.demo.model.EmpleadoMantieneEquipamiento;
import com.gestion_medica.demo.model.keys.EmpleadoMantieneEquipamientoId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;


@Repository
public interface EmpleadoMantieneEquipamientoRepository extends JpaRepository<EmpleadoMantieneEquipamiento, EmpleadoMantieneEquipamientoId> {
    
    /**
     * Obtener todos los empleados que mantienen un equipamiento específico
     */
    @Query("SELECT e FROM EmpleadoMantieneEquipamiento e WHERE e.codEquip = :codEquip")
    List<EmpleadoMantieneEquipamiento> findByCodEquip(@Param("codEquip") Integer codEquip);

    /**
     * Obtener asignaciones por ID de empleado
     */
    List<EmpleadoMantieneEquipamiento> findByIdEmpleado(Integer idEmpleado);
    
    /**
     * Verificar si un empleado ya está asignado a un equipamiento
     */
    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM EmpleadoMantieneEquipamiento e WHERE e.codEquip = :codEquip AND e.numDocumento = :numDocumento AND e.idEmpleado = :idEmpleado")
    boolean existsAssignment(@Param("codEquip") Integer codEquip, @Param("numDocumento") Integer numDocumento, @Param("idEmpleado") Integer idEmpleado);
}

