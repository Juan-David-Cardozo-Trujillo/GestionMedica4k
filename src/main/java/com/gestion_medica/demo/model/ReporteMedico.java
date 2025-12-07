package com.gestion_medica.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "reportes_medicos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteMedico {

    @Id
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
