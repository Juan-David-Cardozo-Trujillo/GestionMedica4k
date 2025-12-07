package com.gestion_medica.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "persona")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Persona {

    @Id
    @Column(name = "numdocumento")
    private Integer numDocumento;

    @Column(name = "genero", nullable = false, length = 50)
    private String genero;

    @Column(name = "tipodocumento", nullable = false, length = 50)
    private String tipoDocumento;

    @Column(name = "fechanacimiento", nullable = false)
    private LocalDate fechaNacimiento;

    @Column(name = "apellidopersona", nullable = false, length = 50)
    private String apellidoPersona;

    @Column(name = "nombrepersona", nullable = false, length = 50)
    private String nombrePersona;

    @Column(name = "correo", nullable = false, length = 50)
    private String correo;
}
