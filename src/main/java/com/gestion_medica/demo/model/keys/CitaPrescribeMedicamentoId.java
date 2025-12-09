package com.gestion_medica.demo.model.keys;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class CitaPrescribeMedicamentoId implements Serializable {

    private static final long serialVersionUID = 1L;
    
    private Integer idCita;
    private Integer codMed;
}
