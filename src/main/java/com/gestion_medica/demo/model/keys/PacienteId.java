package com.gestion_medica.demo.model.keys;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PacienteId implements Serializable {

    private Integer codPaciente;
    private Integer numDocumento;
}
