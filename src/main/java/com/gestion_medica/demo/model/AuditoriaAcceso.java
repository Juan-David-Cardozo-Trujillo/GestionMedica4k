package com.gestion_medica.demo.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
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
public class AuditoriaAcceso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idevento")
    private Integer idEvento;

    @Column(name = "iporigen", nullable = false, length = 50)
    private String ipOrigen;

    @Column(name = "accion", nullable = false, length = 50)
    private String accion;

    @Column(name = "numdocumento")
    private Integer numDocumento;

    @Column(name = "idempleado")
    private Integer idEmpleado;

    @Column(name = "idusuario")
    private Integer idUsuario;

    @Column(name = "fechaevento", nullable = false)
    private LocalDate fechaEvento;

    @Column(name = "tablaafectada", nullable = false, length = 50)
    private String tablaAfectada;

    @ManyToOne
    @JoinColumn(name = "idusuario", insertable = false, updatable = false)
    private Usuario usuario;
}
