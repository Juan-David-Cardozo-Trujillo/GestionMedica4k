package com.gestion_medica.demo.model;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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

    @Column(name = "tiposervicio", nullable = false, length = 50)
    private String tipoServicio;

    @Column(name = "estado", nullable = false, length = 50)
    private String estado;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "hora", nullable = false)
    private LocalTime hora;

    @Column(name = "numdocumentoemp")
    private Integer numDocumentoEmp;

    @Column(name = "idempleado")
    private Integer idEmpleado;

    @Column(name = "codpaciente")
    private Integer codPaciente;

    @Column(name = "numdocumentopac")
    private Integer numDocumentoPac;
}
