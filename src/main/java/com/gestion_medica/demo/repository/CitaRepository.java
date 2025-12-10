package com.gestion_medica.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.gestion_medica.demo.model.Cita;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Integer> {
    
    // Buscar citas por código de paciente
    @Query("SELECT c FROM Cita c WHERE c.paciente.codPaciente = :codPaciente ORDER BY c.fecha DESC, c.hora DESC")
    List<Cita> findByPaciente(@Param("codPaciente") Integer codPaciente);
    
    // Buscar citas próximas del paciente (estado programada)
    @Query("SELECT c FROM Cita c WHERE c.paciente.codPaciente = :codPaciente AND c.estado = 'Programada' ORDER BY c.fecha ASC, c.hora ASC")
    List<Cita> findCitasProximasByPaciente(@Param("codPaciente") Integer codPaciente);
    
    // Buscar historial de citas del paciente (completadas o canceladas)
    @Query("SELECT c FROM Cita c WHERE c.paciente.codPaciente = :codPaciente AND c.estado IN ('Completada', 'Cancelada') ORDER BY c.fecha DESC, c.hora DESC")
    List<Cita> findHistorialCitasByPaciente(@Param("codPaciente") Integer codPaciente);
}
