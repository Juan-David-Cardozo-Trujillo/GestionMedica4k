package com.gestion_medica.demo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinColumns;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "citas")
@Data
@NoArgsConstructor
@AllArgsConstructor
// ... imports y annotations igual ...
public class Cita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idcita")
    private Integer idCita;

    // ... campos simples (tipoServicio, estado, fecha, hora) se quedan igual ...
    // --- CAMBIO AQUÍ: BORRAMOS LOS 4 CAMPOS INTEGER SUELTOS ---
    // Borrar: private Integer numDocumentoEmp;
    // Borrar: private Integer idEmpleado;
    // Borrar: private Integer codPaciente;
    // Borrar: private Integer numDocumentoPac;
    // --- CORRECCIÓN: Quitamos el insertable=false para que estos objetos guarden los datos ---
    @ManyToOne
    @JoinColumns({
        @JoinColumn(name = "numdocumentoemp", referencedColumnName = "numdocumento"), // Editable
        @JoinColumn(name = "idempleado", referencedColumnName = "idempleado") // Editable
    })
    private Empleado empleado;

    @ManyToOne
    @JoinColumns({
        @JoinColumn(name = "codpaciente", referencedColumnName = "codpaciente"),      // Editable
        @JoinColumn(name = "numdocumentopac", referencedColumnName = "numdocumento") // Editable
    })
    private Paciente paciente;
}
