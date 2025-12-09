package com.gestion_medica.demo.model;

import java.time.LocalDate;
import java.time.LocalTime;

import com.gestion_medica.demo.model.keys.HistoriaClinicaRegistraDiagnosticaId;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "historias_clinicas_registra_diagnostica")
@IdClass(HistoriaClinicaRegistraDiagnosticaId.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HistoriaClinicaRegistraDiagnostica {

    @Id
    @Column(name = "codhistoria")
    private Integer codHistoria;

    @Id
    @Column(name = "idenfermedad")
    private Integer idEnfermedad;

    @Id
    @Column(name = "idcita")
    private Integer idCita;

    @Column(name = "fecharegistro", nullable = false)
    private LocalDate fechaRegistro;

    @Column(name = "horaregistro", nullable = false)
    private LocalTime horaRegistro;

    @ManyToOne
    @JoinColumn(name = "codhistoria", insertable = false, updatable = false)
    private HistoriaClinica historiaClinica;

    @ManyToOne
    @JoinColumn(name = "idenfermedad", insertable = false, updatable = false)
    private Enfermedad enfermedad;

    @ManyToOne
    @JoinColumn(name = "idcita", insertable = false, updatable = false)
    private Cita cita;
}
