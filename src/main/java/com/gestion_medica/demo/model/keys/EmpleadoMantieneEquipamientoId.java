package com.gestion_medica.demo.model.keys;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmpleadoMantieneEquipamientoId implements Serializable {

    private Integer numDocumento;
    private Integer idEmpleado;
    private Integer codEquip;
}
