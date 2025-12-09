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

    // --- CAMBIO: BORRAR ESTE (Es una FK normal) ---
    // Borrar: private Integer codHistoria;
    // ... campos simples (dosis, frecuencia...) quedan igual ...
    // ESTOS SE QUEDAN READ-ONLY (Porque ya tienes los Integers arriba como ID)
    @ManyToOne
    @JoinColumn(name = "idcita", insertable = false, updatable = false)
    private Cita cita;

    @ManyToOne
    @JoinColumn(name = "codmed", insertable = false, updatable = false)
    private Medicamento medicamento;

    // --- CORRECCIÓN: ESTE SE VUELVE EDITABLE (Reemplaza al Integer codHistoria) ---
    @ManyToOne
    @JoinColumn(name = "codhistoria") // Sin insertable=false
    private HistoriaClinica historiaClinica;
}
