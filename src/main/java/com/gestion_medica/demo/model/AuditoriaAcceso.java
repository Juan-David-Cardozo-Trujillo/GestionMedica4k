package com.gestion_medica.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "auditoria_accesos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditoriaAcceso {

    @Id
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
