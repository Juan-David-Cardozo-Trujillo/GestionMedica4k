package com.gestion_medica.demo.model;

import java.time.LocalDate;
import java.time.LocalTime;

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
@Table(name = "citas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idcita")
    private Integer idCita;

    @Column(name = "tiposervicio", length = 50)
    private String tipoServicio;

    @Column(name = "estado", length = 50)
    private String estado;

    @Column(name = "fecha")
    private LocalDate fecha;

    @Column(name = "hora")
    private LocalTime hora;

    @ManyToOne
    @JoinColumns({
        @JoinColumn(name = "numdocumentoemp", referencedColumnName = "numdocumento"),
        @JoinColumn(name = "idempleado", referencedColumnName = "idempleado")
    })
    private Empleado empleado;

    @ManyToOne
    @JoinColumns({
        @JoinColumn(name = "codpaciente", referencedColumnName = "codpaciente"),
        @JoinColumn(name = "numdocumentopac", referencedColumnName = "numdocumento")
    })
    private Paciente paciente;
}
