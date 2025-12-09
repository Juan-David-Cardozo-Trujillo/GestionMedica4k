package com.gestion_medica.demo.model;

import com.gestion_medica.demo.model.keys.CitaDiagnosticaEnfermedadId;

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
@Table(name = "citas_diagnostica_enfermedades")
@IdClass(CitaDiagnosticaEnfermedadId.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CitaDiagnosticaEnfermedad {

    @Id
    @Column(name = "idcita")
    private Integer idCita;

    @Id
    @Column(name = "idenfermedad")
    private Integer idEnfermedad;

    @ManyToOne
    @JoinColumn(name = "idcita", insertable = false, updatable = false)
    private Cita cita;

    @ManyToOne
    @JoinColumn(name = "idenfermedad", insertable = false, updatable = false)
    private Enfermedad enfermedad;
}
