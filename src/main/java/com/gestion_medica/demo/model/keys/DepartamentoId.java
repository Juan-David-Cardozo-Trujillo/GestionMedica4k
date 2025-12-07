package com.gestion_medica.demo.model.keys;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

// ==================== DepartamentoId ====================
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepartamentoId implements Serializable {

    private String nombreDepartamento;
    private Integer idSede;
}
