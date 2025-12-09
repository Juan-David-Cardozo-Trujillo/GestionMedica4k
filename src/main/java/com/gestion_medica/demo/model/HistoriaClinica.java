package com.gestion_medica.demo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinColumns;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "historias_clinicas")
@Data
@NoArgsConstructor
@AllArgsConstructor
// ... imports y annotations ...
public class HistoriaClinica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "codhistoria")
    private Integer codHistoria;

    // --- CAMBIO: BORRAR ESTOS DOS ---
    // Borrar: private Integer codPaciente;
    // Borrar: private Integer numDocumento;
    // --- CORRECCIÓN: Objeto editable ---
    @ManyToOne
    @JoinColumns({
        @JoinColumn(name = "codpaciente", referencedColumnName = "codpaciente"),
        @JoinColumn(name = "numdocumento", referencedColumnName = "numdocumento")
    })
    private Paciente paciente;
}
