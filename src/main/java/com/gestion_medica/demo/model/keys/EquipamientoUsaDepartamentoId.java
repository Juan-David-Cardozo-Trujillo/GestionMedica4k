package com.gestion_medica.demo.model.keys;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EquipamientoUsaDepartamentoId implements Serializable {

    private Integer codEquip;
    private String nombreDepartamento;
    private Integer idSede;
}
