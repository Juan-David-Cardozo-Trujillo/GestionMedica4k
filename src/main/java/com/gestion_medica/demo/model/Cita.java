package com.gestion_medica.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "citas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cita {

    @Id
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
