package com.gestion_medica.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "usuario")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    @Id
    @Column(name = "idusuario")
    private Integer idUsuario;

    @Column(name = "nombreusuario", nullable = false, unique = true, length = 50)
    private String nombreUsuario;

    @Column(name = "contrasenaencriptada", nullable = false, length = 255)
    private String contrasenaEncriptada;

    @Column(name = "numdocumento")
    private Integer numDocumento;

    @ManyToOne
    @JoinColumn(name = "numdocumento", insertable = false, updatable = false)
    private Persona persona;
}
