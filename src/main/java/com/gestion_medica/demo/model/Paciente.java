package com.gestion_medica.demo.model;

import com.gestion_medica.demo.model.keys.PacienteId;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "pacientes")
@IdClass(PacienteId.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Paciente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "codpaciente")
    private Integer codPaciente;

    @Id
    @Column(name = "numdocumento")
    private Integer numDocumento;

    @Column(name = "dirpaciente", nullable = false, length = 50)
    private String dirPaciente;

    // Relación con Persona usando los campos de la llave primaria
    @ManyToOne
    @JoinColumn(name = "numdocumento", insertable = false, updatable = false)
    private Persona persona;
}
