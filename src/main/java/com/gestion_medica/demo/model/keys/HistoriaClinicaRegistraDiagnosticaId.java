package com.gestion_medica.demo.model.keys;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HistoriaClinicaRegistraDiagnosticaId implements Serializable {

    private Integer codHistoria;
    private Integer idEnfermedad;
    private Integer idCita;
}
