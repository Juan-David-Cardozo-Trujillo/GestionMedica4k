package com.gestion_medica.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "enfermedades")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Enfermedad {

    @Id
    @Column(name = "idenfermedad")
    private Integer idEnfermedad;

    @Column(name = "nombreenfermedad", nullable = false, length = 50)
    private String nombreEnfermedad;

    @Column(name = "descripcionenfermedad", nullable = false, length = 150)
    private String descripcionEnfermedad;
}
