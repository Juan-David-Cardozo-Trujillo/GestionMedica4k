package com.gestion_medica.demo.model.keys;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CitaDiagnosticaEnfermedadId implements Serializable {

    private Integer idCita;
    private Integer idEnfermedad;
}
