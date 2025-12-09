package com.gestion_medica.demo.repository;

import com.gestion_medica.demo.model.EquipamientoUsaDepartamento;
import com.gestion_medica.demo.model.keys.EquipamientoUsaDepartamentoId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;


@Repository
public interface EquipamientoUsaDepartamentoRepository extends JpaRepository<EquipamientoUsaDepartamento, EquipamientoUsaDepartamentoId> {
    /**
     * Obtener todas las asignaciones de un equipamiento
     */
    @Query("SELECT e FROM EquipamientoUsaDepartamento e WHERE e.codEquip = :codEquip")
    List<EquipamientoUsaDepartamento> findByCodEquip(@Param("codEquip") Integer codEquip);
    
    /**
     * Verificar si un equipamiento ya está asignado a un departamento
     */
    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM EquipamientoUsaDepartamento e WHERE e.codEquip = :codEquip AND e.nombreDepartamento = :nombreDepartamento AND e.idSede = :idSede")
    boolean existsAssignment(@Param("codEquip") Integer codEquip, @Param("nombreDepartamento") String nombreDepartamento, @Param("idSede") Integer idSede);
}

