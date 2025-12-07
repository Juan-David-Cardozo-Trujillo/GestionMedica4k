package com.gestion_medica.demo.model;

import com.gestion_medica.demo.model.keys.EquipamientoUsaDepartamentoId;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "equipamientos_usa_departamentos")
@IdClass(EquipamientoUsaDepartamentoId.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EquipamientoUsaDepartamento {

    @Id
    @Column(name = "codequip")
    private Integer codEquip;

    @Id
    @Column(name = "nombredepartamento", length = 50)
    private String nombreDepartamento;

    @Id
    @Column(name = "idsede")
    private Integer idSede;

    @ManyToOne
    @JoinColumn(name = "codequip", insertable = false, updatable = false)
    private Equipamiento equipamiento;
}
