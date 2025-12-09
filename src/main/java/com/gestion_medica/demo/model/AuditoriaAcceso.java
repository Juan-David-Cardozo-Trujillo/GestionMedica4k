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
@Table(name = "auditoria_accesos")
@Data
@NoArgsConstructor
@AllArgsConstructor
// ... imports y annotations ...
public class AuditoriaAcceso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idevento")
    private Integer idEvento;

    // ... campos simples (ip, accion, fecha, tabla) quedan igual ...
    // --- CAMBIO: BORRAR ESTOS TRES ---
    // Borrar: private Integer numDocumento;
    // Borrar: private Integer idEmpleado;
    // Borrar: private Integer idUsuario;
    // --- CORRECCIÓN: Objetos editables ---
    @ManyToOne
    @JoinColumns({
        @JoinColumn(name = "numdocumento", referencedColumnName = "numdocumento"),
        @JoinColumn(name = "idempleado", referencedColumnName = "idempleado")
    })
    private Empleado empleado;

    @ManyToOne
    @JoinColumn(name = "idusuario") // Editable
    private Usuario usuario;
}
