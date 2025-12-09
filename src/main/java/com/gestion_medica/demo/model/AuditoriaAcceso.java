package com.gestion_medica.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "auditoria_accesos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditoriaAcceso {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "audit_seq_gen")
    @SequenceGenerator(name = "audit_seq_gen", sequenceName = "public.auditoria_accesos_idevento_seq", allocationSize = 1)
    @Column(name = "idevento")
    private Integer idEvento;

    @Column(name = "iporigen", nullable = false, length = 50)
    private String ipOrigen;

    @Column(name = "accion", nullable = false, length = 50)
    private String accion; // SELECT, INSERT, UPDATE, DELETE

    @Column(name = "fechaevento", nullable = false)
    private LocalDateTime fechaEvento;

    @Column(name = "tablaafectada", nullable = false, length = 50)
    private String tablaAfectada;


    // Relación con Usuario (Quien hizo la acción)
    @ManyToOne
    @JoinColumn(name = "idusuario")
    private Usuario usuario;
}
