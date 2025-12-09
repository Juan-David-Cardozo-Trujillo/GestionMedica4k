package com.gestion_medica.demo.model;

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
@Table(name = "enfermedades")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Enfermedad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idenfermedad")
    private Integer idEnfermedad;

    @Column(name = "nombreenfermedad", nullable = false, length = 50)
    private String nombreEnfermedad;

    @Column(name = "descripcionenfermedad", nullable = false, length = 150)
    private String descripcionEnfermedad;
}
