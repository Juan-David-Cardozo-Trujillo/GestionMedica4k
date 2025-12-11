package com.gestion_medica.demo.model;

import jakarta.persistence.*;
import java.time.LocalDate;
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

    @Column(name = "tiporeporte", length = 50, nullable = false)
    private String tipoReporte;

    @Column(name = "resumen", length = 150, nullable = false)
    private String resumen;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "idsede", insertable = false, updatable = false)
    private SedeHospitalaria sede;
}
