package com.gestion_medica.demo.model;

import com.gestion_medica.demo.model.keys.EmpleadoMantieneEquipamientoId;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinColumns;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    @JoinColumns({
        @JoinColumn(name = "numdocumento", referencedColumnName = "numdocumento", insertable = false, updatable = false),
        @JoinColumn(name = "idempleado", referencedColumnName = "idempleado", insertable = false, updatable = false)
    })
    private Empleado empleado;

    @ManyToOne
    @JoinColumn(name = "codequip", insertable = false, updatable = false)
    private Equipamiento equipamiento;
}
