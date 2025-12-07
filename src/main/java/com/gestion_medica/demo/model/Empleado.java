package com.gestion_medica.demo.model;

import com.gestion_medica.demo.model.keys.EmpleadoId;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "empleados")
@IdClass(EmpleadoId.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Empleado {

    @Id
    @Column(name = "numdocumento")
    private Integer numDocumento;

    @Id
    @Column(name = "idempleado")
    private Integer idEmpleado;

    @Column(name = "nombredepartamento", length = 50)
    private String nombreDepartamento;

    @Column(name = "idsede")
    private Integer idSede;

    @Column(name = "cargo", nullable = false, length = 50)
    private String cargo;

    @ManyToOne
    @JoinColumn(name = "numdocumento", insertable = false, updatable = false)
    private Persona persona;
}
