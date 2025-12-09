package com.gestion_medica.demo.model;

import com.gestion_medica.demo.model.keys.PacienteAsisteSedeId;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinColumns;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    @JoinColumns({
        @JoinColumn(name = "codpaciente", referencedColumnName = "codpaciente", insertable = false, updatable = false),
        @JoinColumn(name = "numdocumento", referencedColumnName = "numdocumento", insertable = false, updatable = false)
    })
    private Paciente paciente;

    @ManyToOne
    @JoinColumn(name = "idsede", insertable = false, updatable = false)
    private SedeHospitalaria sede;
}
