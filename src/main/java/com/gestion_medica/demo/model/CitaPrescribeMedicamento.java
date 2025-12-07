package com.gestion_medica.demo.model;

import com.gestion_medica.demo.model.keys.CitaPrescribeMedicamentoId;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "citas_prescribe_medicamentos")
@IdClass(CitaPrescribeMedicamentoId.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CitaPrescribeMedicamento {

    @Id
    @Column(name = "idcita")
    private Integer idCita;

    @Id
    @Column(name = "codmed")
    private Integer codMed;

    @Column(name = "codhistoria", nullable = false)
    private Integer codHistoria;

    @Column(name = "dosis", nullable = false, length = 50)
    private String dosis;

    @Column(name = "frecuencia", nullable = false, length = 50)
    private String frecuencia;

    @Column(name = "fechaemision", nullable = false)
    private LocalDate fechaEmision;

    @Column(name = "duracion", nullable = false, length = 50)
    private String duracion;

    @ManyToOne
    @JoinColumn(name = "idcita", insertable = false, updatable = false)
    private Cita cita;

    @ManyToOne
    @JoinColumn(name = "codmed", insertable = false, updatable = false)
    private Medicamento medicamento;
}
