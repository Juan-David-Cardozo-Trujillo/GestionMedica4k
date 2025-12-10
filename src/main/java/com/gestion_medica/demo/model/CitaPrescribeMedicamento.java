package com.gestion_medica.demo.model;

import com.gestion_medica.demo.model.keys.CitaPrescribeMedicamentoId;

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
@Table(name = "citas_prescribe_medicamentos")
@IdClass(CitaPrescribeMedicamentoId.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CitaPrescribeMedicamento {

    // ESTOS SE QUEDAN (Son PK en el @IdClass)
    @Id
    @Column(name = "idcita")
    private Integer idCita;

    @Id
    @Column(name = "codmed")
    private Integer codMed;

    // Campos adicionales solicitados
    @Column(name = "dosis", length = 50, nullable = false)
    private String dosis;

    @Column(name = "frecuencia", length = 50, nullable = false)
    private String frecuencia;

    @Column(name = "fechaemision", nullable = false)
    private java.time.LocalDate fechaEmision;
    
    @Column(name = "duracion", length = 50, nullable = false)
    private String duracion;

    // Relaciones
    @ManyToOne
    @JoinColumn(name = "idcita", insertable = false, updatable = false)
    private Cita cita;

    @ManyToOne
    @JoinColumn(name = "codmed", insertable = false, updatable = false)
    private Medicamento medicamento;

    @ManyToOne
    @JoinColumn(name = "codhistoria", nullable = false)
    private HistoriaClinica historiaClinica;
}
