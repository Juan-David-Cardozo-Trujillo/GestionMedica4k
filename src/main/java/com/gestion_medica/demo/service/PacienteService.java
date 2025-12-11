package com.gestion_medica.demo.service;

import com.gestion_medica.demo.config.SedeContextHolder;
import com.gestion_medica.demo.model.Paciente;
import com.gestion_medica.demo.model.Persona;
import com.gestion_medica.demo.repository.PacienteRepository;
import com.gestion_medica.demo.repository.PersonaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class PacienteService {

    @Autowired
    private PacienteRepository pacienteRepository;
    
    @Autowired
    private PersonaRepository personaRepository;
    
    /**
     * Crear paciente - Operación híbrida
     * 1. Guarda Persona en BD COMPARTIDA
     * 2. Guarda Paciente en BD LOCAL de la sede
     */
    @Transactional
    public Paciente crearPaciente(Persona persona, String direccion, Integer idSede) {
        
        // 1. Guardar Persona en BD COMPARTIDA
        SedeContextHolder.setSedeDataSource("SHARED");
        Persona personaGuardada = personaRepository.save(persona);
        System.out.println("✅ Persona guardada en BD COMPARTIDA");
        
        // 2. Guardar Paciente en BD LOCAL de la sede
        String dataSource = idSede == 1 ? "SEDE1" : "SEDE2";
        SedeContextHolder.setSedeDataSource(dataSource);
        
        Paciente paciente = new Paciente();
        paciente.setNumDocumento(personaGuardada.getNumDocumento());
        paciente.setDirPaciente(direccion);
        paciente.setPersona(personaGuardada);
        
        Paciente pacienteGuardado = pacienteRepository.save(paciente);
        System.out.println("✅ Paciente guardado en " + dataSource);
        
        return pacienteGuardado;
    }
    
    /**
     * Buscar pacientes de una sede específica
     */
    public List<Paciente> findBySede(Integer idSede) {
        String dataSource = idSede == 1 ? "SEDE1" : "SEDE2";
        SedeContextHolder.setSedeDataSource(dataSource);
        
        return pacienteRepository.findAll();
    }
}
