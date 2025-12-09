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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idusuario")
    private Integer idUsuario;

    @Column(name = "nombreusuario", nullable = false, unique = true, length = 50)
    private String nombreUsuario;

    @Column(name = "contrasenaencriptada", nullable = false, length = 255)
    private String contrasenaEncriptada;

    @Column(name = "rol", nullable = false, length = 50)
    private String rol;

    @ManyToOne
    @JoinColumn(name = "numdocumento")
    private Persona persona;
}
