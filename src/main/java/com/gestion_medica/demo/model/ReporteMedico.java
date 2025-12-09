package com.gestion_medica.demo.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "reportes_medicos")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class ReporteMedico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idreporte")
    private Integer idReporte;

    @Column(name = "idsede")
    private Integer idSede;

    @Column(name = "fechageneracion", nullable = false)
    private LocalDate fechaGeneracion;

    @Column(name = "tiporeporte", nullable = false, length = 50)
    private String tipoReporte;

    @Column(name = "resumen", nullable = false, length = 150)
    private String resumen;

    @ManyToOne
    @JoinColumn(name = "idsede", insertable = false, updatable = false)
    private SedeHospitalaria sede;
}
