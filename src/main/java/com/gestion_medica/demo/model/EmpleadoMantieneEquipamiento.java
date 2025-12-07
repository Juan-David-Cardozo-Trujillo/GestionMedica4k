package com.gestion_medica.demo.model;

import com.gestion_medica.demo.model.keys.EmpleadoMantieneEquipamientoId;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "empleados_mantienen_equipamientos")
@IdClass(EmpleadoMantieneEquipamientoId.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmpleadoMantieneEquipamiento {

    @Id
    @Column(name = "numdocumento")
    private Integer numDocumento;

    @Id
    @Column(name = "idempleado")
    private Integer idEmpleado;

    @Id
    @Column(name = "codequip")
    private Integer codEquip;

    @ManyToOne
    @JoinColumn(name = "codequip", insertable = false, updatable = false)
    private Equipamiento equipamiento;
}
