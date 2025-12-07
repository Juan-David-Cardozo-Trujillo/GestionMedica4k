package com.gestion_medica.demo.model;

import com.gestion_medica.demo.model.keys.PacienteAsisteSedeId;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// ==================== PacienteAsisteSede ====================
@Entity
@Table(name = "pacientes_asiste_sedes_hospitalarias")
@IdClass(PacienteAsisteSedeId.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PacienteAsisteSede {

    @Id
    @Column(name = "codpaciente")
    private Integer codPaciente;

    @Id
    @Column(name = "numdocumento")
    private Integer numDocumento;

    @Id
    @Column(name = "idsede")
    private Integer idSede;

    @ManyToOne
    @JoinColumn(name = "idsede", insertable = false, updatable = false)
    private SedeHospitalaria sede;
}
