package com.gestion_medica.demo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "sedes_hospitalarias")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SedeHospitalaria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idsede")
    private Integer idSede;

    @Column(name = "nombresede", nullable = false, length = 50)
    private String nombreSede;
}
