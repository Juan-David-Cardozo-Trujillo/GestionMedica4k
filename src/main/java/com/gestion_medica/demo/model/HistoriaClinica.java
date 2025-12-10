package com.gestion_medica.demo.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinColumns;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "historias_clinicas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HistoriaClinica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "codhistoria")
    private Integer codHistoria;

    // Relación con Paciente usando llave compuesta
    @ManyToOne
    @JoinColumns({
        @JoinColumn(name = "codpaciente", referencedColumnName = "codpaciente"),
        @JoinColumn(name = "numdocumento", referencedColumnName = "numdocumento")
    })
    @JsonIgnore
    private Paciente paciente;

    
}
