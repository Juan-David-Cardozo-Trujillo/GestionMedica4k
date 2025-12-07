package com.gestion_medica.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "medicamentos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Medicamento {

    @Id
    @Column(name = "codmed")
    private Integer codMed;

    @Column(name = "stock", nullable = false)
    private Integer stock;

    @Column(name = "proveedor", nullable = false, length = 50)
    private String proveedor;

    @Column(name = "unidad", nullable = false, length = 50)
    private String unidad;

    @Column(name = "descripcion", nullable = false, length = 50)
    private String descripcion;

    @Column(name = "nombremed", nullable = false, length = 50)
    private String nombreMed;
}
