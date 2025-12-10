package com.gestion_medica.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gestion_medica.demo.model.Departamento;
import com.gestion_medica.demo.model.Empleado;
import com.gestion_medica.demo.model.Persona;
import com.gestion_medica.demo.model.keys.EmpleadoId;
import com.gestion_medica.demo.repository.EmpleadoRepository;
import com.gestion_medica.demo.repository.PersonaRepository;

@Service
@Transactional
public class EmpleadoService {

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private PersonaRepository personaRepository;

    public List<Empleado> findAll() {
        return empleadoRepository.findAll();
    }

    public Empleado findById(EmpleadoId id) {
        return empleadoRepository.findById(id).orElse(null);
    }

    // Método para guardar Persona + Empleado recibiendo datos sueltos
    public Empleado registrarEmpleadoSinDTO(Persona persona, String cargo, String nomDepto, Integer idSede) {

        // 1. Guardar la Persona primero (Fundamental para tener el numDocumento en BD)
        Persona personaGuardada = personaRepository.save(persona);

        // 2. Crear referencia al Departamento solo si se proporcionan los datos
        Departamento deptoRef = null;
        if (nomDepto != null && !nomDepto.isBlank() && idSede != null) {
            deptoRef = new Departamento();
            deptoRef.setNombreDepartamento(nomDepto);
            deptoRef.setIdSede(idSede);
        }

        // 3. Crear el Empleado
        Empleado emp = new Empleado();
        emp.setNumDocumento(personaGuardada.getNumDocumento()); // Seteamos parte 1 de la PK
        // La parte 2 (idEmpleado) se genera automática por la secuencia

        emp.setCargo(cargo);
        emp.setDepartamento(deptoRef); // Puede ser null

        return empleadoRepository.save(emp);
    }

    // Método para eliminar usando la llave compuesta
    public void eliminarEmpleado(Integer numDocumento, Integer idEmpleado) {
        EmpleadoId id = new EmpleadoId(numDocumento, idEmpleado);

        if (!empleadoRepository.existsById(id)) {
            throw new RuntimeException("El empleado no existe");
        }
        empleadoRepository.deleteById(id);
    }

    // ... imports ...
    public Empleado actualizarEmpleado(Integer idEmpleado, Integer numDocumento, Persona personaDatos, String cargo, String nomDepto, Integer idSede) {

        // 1. Buscamos el Empleado existente por su llave compuesta
        EmpleadoId id = new EmpleadoId(numDocumento, idEmpleado);
        Empleado empleadoExistente = empleadoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        // 2. Actualizamos los datos de la Persona asociada
        Persona personaExistente = empleadoExistente.getPersona();
        // OJO: No cambiamos el numDocumento porque es la llave primaria
        personaExistente.setNombrePersona(personaDatos.getNombrePersona());
        personaExistente.setApellidoPersona(personaDatos.getApellidoPersona());
        personaExistente.setTipoDocumento(personaDatos.getTipoDocumento());
        personaExistente.setGenero(personaDatos.getGenero());
        personaExistente.setFechaNacimiento(personaDatos.getFechaNacimiento());
        personaExistente.setCorreo(personaDatos.getCorreo());

        // Guardamos los cambios de la persona
        personaRepository.save(personaExistente);

        // 3. Actualizamos los datos del Empleado
        empleadoExistente.setCargo(cargo);

        // Actualizamos la referencia al departamento
        Departamento depto = new Departamento();
        depto.setNombreDepartamento(nomDepto);
        depto.setIdSede(idSede);
        empleadoExistente.setDepartamento(depto);

        // 4. Guardamos el empleado existente (Esto hace el UPDATE en SQL)
        return empleadoRepository.save(empleadoExistente);
    }
}
