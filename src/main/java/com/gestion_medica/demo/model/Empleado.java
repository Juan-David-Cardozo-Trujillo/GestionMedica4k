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

    // --- PARTE 1: SE QUEDAN (Porque son @Id / Llave Primaria) ---
    @Id
    @Column(name = "numdocumento")
    private Integer numDocumento;

    @Id
    // CAMBIO: Usamos SEQUENCE aquí también
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "empleado_seq_gen")
    @SequenceGenerator(name = "empleado_seq_gen", sequenceName = "empleados_idempleado_seq", allocationSize = 1)
    @Column(name = "idempleado")
    private Integer idEmpleado;

    // --- PARTE 2: SE BORRAN (Porque son FK normales) ---
    // Borrar: private String nombreDepartamento;
    // Borrar: private Integer idSede;
    @Column(name = "cargo", nullable = false, length = 50)
    private String cargo;

    // --- RELACIONES ---
    // 1. Persona se queda SOLO LECTURA (porque numDocumento ya es @Id arriba)
    @ManyToOne
    @JoinColumn(name = "numdocumento", insertable = false, updatable = false)
    private Persona persona;

    // 2. Departamento se vuelve EDITABLE (porque borramos los campos sueltos)
    @ManyToOne
    @JoinColumns({
        @JoinColumn(name = "nombredepartamento", referencedColumnName = "nombredepartamento"), // Editable
        @JoinColumn(name = "idsede", referencedColumnName = "idsede") // Editable
    })
    private Departamento departamento;
}
