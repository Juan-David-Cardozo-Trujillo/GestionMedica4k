package com.gestion_medica.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "equipamientos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Equipamiento {

    @Id
    @Column(name = "codequip")
    private Integer codEquip;

    @Column(name = "nombreequip", nullable = false, length = 50)
    private String nombreEquip;

    @Column(name = "fechamantenimiento", nullable = false)
    private LocalDate fechaMantenimiento;

    @Column(name = "estado", nullable = false, length = 50)
    private String estado;
}
