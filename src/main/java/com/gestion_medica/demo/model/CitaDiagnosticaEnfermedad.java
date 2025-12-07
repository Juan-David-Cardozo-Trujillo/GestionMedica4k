package com.gestion_medica.demo.model;

import com.gestion_medica.demo.model.keys.CitaDiagnosticaEnfermedadId;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

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
