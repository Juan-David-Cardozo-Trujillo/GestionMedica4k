package com.gestion_medica.demo.model;

import com.gestion_medica.demo.model.keys.HistoriaClinicaRegistraDiagnosticaId;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

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
}
