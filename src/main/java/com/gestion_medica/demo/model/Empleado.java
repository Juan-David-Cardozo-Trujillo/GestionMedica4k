package com.gestion_medica.demo.model;

import com.gestion_medica.demo.model.keys.EmpleadoId;

import jakarta.persistence.Column; // Importa todo para evitar errores de JoinColumn
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinColumns;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "empleado_seq_gen")
    @SequenceGenerator(
            name = "empleado_seq_gen",
            sequenceName = "public.empleados_idempleado_seq", // <--- CORREGIDO CON 'public.'
            allocationSize = 1
    )
    @Column(name = "idempleado")
    private Integer idEmpleado;

    @Column(name = "cargo", nullable = false, length = 50)
    private String cargo;

    // --- RELACIONES ---
    @ManyToOne
    @JoinColumn(name = "numdocumento", insertable = false, updatable = false)
    private Persona persona;

    @ManyToOne
    @JoinColumns({
        @JoinColumn(name = "nombredepartamento", referencedColumnName = "nombredepartamento"),
        @JoinColumn(name = "idsede", referencedColumnName = "idsede")
    })
    private Departamento departamento;
}
