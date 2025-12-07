package com.gestion_medica.demo.model;

import com.gestion_medica.demo.model.keys.DepartamentoId;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "departamentos")
@IdClass(DepartamentoId.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Departamento {

    @Id
    @Column(name = "nombredepartamento", length = 50)
    private String nombreDepartamento;

    @Id
    @Column(name = "idsede")
    private Integer idSede;

    @ManyToOne
    @JoinColumn(name = "idsede", insertable = false, updatable = false)
    private SedeHospitalaria sede;
}
