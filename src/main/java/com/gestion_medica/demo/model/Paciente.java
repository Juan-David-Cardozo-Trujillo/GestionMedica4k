package com.gestion_medica.demo.model;

import com.gestion_medica.demo.model.keys.*;
import jakarta.persistence.*;
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
    @Column(name = "codpaciente")
    private Integer codPaciente;

    @Id
    @Column(name = "numdocumento")
    private Integer numDocumento;

    @Column(name = "dirpaciente", nullable = false, length = 50)
    private String dirPaciente;

    @ManyToOne
    @JoinColumn(name = "numdocumento", insertable = false, updatable = false)
    private Persona persona;
}
