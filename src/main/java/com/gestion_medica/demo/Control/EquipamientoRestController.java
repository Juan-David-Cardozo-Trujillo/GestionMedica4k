package com.gestion_medica.demo.Control;

import com.gestion_medica.demo.model.Equipamiento;
import com.gestion_medica.demo.model.EquipamientoUsaDepartamento;
import com.gestion_medica.demo.model.Departamento;
import com.gestion_medica.demo.model.Empleado;
import com.gestion_medica.demo.model.EmpleadoMantieneEquipamiento;
import com.gestion_medica.demo.service.EquipamientoService;
import com.gestion_medica.demo.repository.EquipamientoUsaDepartamentoRepository;
import com.gestion_medica.demo.repository.DepartamentoRepository;
import com.gestion_medica.demo.repository.EmpleadoRepository;
import com.gestion_medica.demo.repository.EmpleadoMantieneEquipamientoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/equipamientos")
@CrossOrigin(origins = {
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:8080"
}, allowedHeaders = "*", allowCredentials = "true")
public class EquipamientoRestController {

    @Autowired
    private EquipamientoService equipamientoService;

    @Autowired
    private EquipamientoUsaDepartamentoRepository equipamientoUsaDepartamentoRepository;

    @Autowired
    private DepartamentoRepository departamentoRepository;

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private EmpleadoMantieneEquipamientoRepository empleadoMantieneEquipamientoRepository;

    /**
     * GET ALL - Listar todos los equipamientos
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllEquipamientos() {
        try {
            List<Equipamiento> equipamientos = equipamientoService.findAll();
            List<Map<String, Object>> response = new ArrayList<>();
            
            for (Equipamiento e : equipamientos) {
                Map<String, Object> equipData = new HashMap<>();
                equipData.put("codequip", e.getCodEquip());
                equipData.put("nombreequip", e.getNombreEquip());
                equipData.put("fechamantenimiento", e.getFechaMantenimiento());
                equipData.put("estado", e.getEstado());
                response.add(equipData);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET BY ID - Obtener equipamiento por ID
     */
    @GetMapping("/{codEquip}")
    public ResponseEntity<Map<String, Object>> getEquipamientoById(@PathVariable Integer codEquip) {
        try {
            Optional<Equipamiento> equipamientoOpt = equipamientoService.findById(codEquip);
            if (equipamientoOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Equipamiento e = equipamientoOpt.get();
            Map<String, Object> equipData = new HashMap<>();
            equipData.put("codequip", e.getCodEquip());
            equipData.put("nombreequip", e.getNombreEquip());
            equipData.put("fechamantenimiento", e.getFechaMantenimiento());
            equipData.put("estado", e.getEstado());
            
            return ResponseEntity.ok(equipData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * POST - Crear nuevo equipamiento
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createEquipamiento(@RequestBody Equipamiento equipamiento) {
        try {
            if (equipamiento.getNombreEquip() == null || equipamiento.getNombreEquip().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            if (equipamiento.getEstado() == null || equipamiento.getEstado().isEmpty()) {
                equipamiento.setEstado("Operativo");
            }
            Equipamiento saved = equipamientoService.save(equipamiento);
            
            Map<String, Object> equipData = new HashMap<>();
            equipData.put("codequip", saved.getCodEquip());
            equipData.put("nombreequip", saved.getNombreEquip());
            equipData.put("fechamantenimiento", saved.getFechaMantenimiento());
            equipData.put("estado", saved.getEstado());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(equipData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * PUT - Actualizar equipamiento existente
     */
    @PutMapping("/{codEquip}")
    public ResponseEntity<Map<String, Object>> updateEquipamiento(
            @PathVariable Integer codEquip,
            @RequestBody Equipamiento equipamientoDetails) {
        try {
            Optional<Equipamiento> equipamientoOpt = equipamientoService.findById(codEquip);
            if (equipamientoOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Equipamiento equipamiento = equipamientoOpt.get();
            if (equipamientoDetails.getNombreEquip() != null) {
                equipamiento.setNombreEquip(equipamientoDetails.getNombreEquip());
            }
            if (equipamientoDetails.getFechaMantenimiento() != null) {
                equipamiento.setFechaMantenimiento(equipamientoDetails.getFechaMantenimiento());
            }
            if (equipamientoDetails.getEstado() != null) {
                equipamiento.setEstado(equipamientoDetails.getEstado());
            }

            Equipamiento updated = equipamientoService.save(equipamiento);
            
            Map<String, Object> equipData = new HashMap<>();
            equipData.put("codequip", updated.getCodEquip());
            equipData.put("nombreequip", updated.getNombreEquip());
            equipData.put("fechamantenimiento", updated.getFechaMantenimiento());
            equipData.put("estado", updated.getEstado());
            
            return ResponseEntity.ok(equipData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * DELETE - Eliminar equipamiento
     */
    @DeleteMapping("/{codEquip}")
    public ResponseEntity<Void> deleteEquipamiento(@PathVariable Integer codEquip) {
        try {
            Optional<Equipamiento> equipamiento = equipamientoService.findById(codEquip);
            if (equipamiento.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            // Eliminar asignaciones primero
            equipamientoUsaDepartamentoRepository.deleteAll(
                equipamientoUsaDepartamentoRepository.findAll().stream()
                    .filter(e -> e.getCodEquip().equals(codEquip))
                    .toList()
            );
            
            equipamientoService.deleteById(codEquip);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET - Obtener departamentos asignados a un equipamiento
     */
    @GetMapping("/{codEquip}/departamentos")
    public ResponseEntity<List<Map<String, Object>>> getDepartamentosAsignados(@PathVariable Integer codEquip) {
        try {
            List<EquipamientoUsaDepartamento> asignaciones = equipamientoUsaDepartamentoRepository.findAll().stream()
                    .filter(e -> e.getCodEquip().equals(codEquip))
                    .toList();

            List<Map<String, Object>> response = new ArrayList<>();
            for (EquipamientoUsaDepartamento asignacion : asignaciones) {
                Map<String, Object> deptData = new HashMap<>();
                deptData.put("nombredepartamento", asignacion.getNombreDepartamento());
                deptData.put("idsede", asignacion.getIdSede());
                
                if (asignacion.getDepartamento() != null) {
                    deptData.put("nombresede", asignacion.getDepartamento().getSede() != null 
                        ? asignacion.getDepartamento().getSede().getNombreSede()
                        : "N/A");
                }
                response.add(deptData);
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * POST - Asignar equipamiento a un departamento
     */
    @PostMapping("/asignar")
    public ResponseEntity<Map<String, String>> asignarDepartamento(@RequestBody Map<String, Object> request) {
        try {
            Integer codEquip = ((Number) request.get("codEquip")).intValue();
            String nombreDepartamento = (String) request.get("nombreDepartamento");
            Integer idSede = ((Number) request.get("idSede")).intValue();

            // Validar que los parámetros no sean nulos
            if (nombreDepartamento == null || nombreDepartamento.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "El nombre del departamento es obligatorio"));
            }

            // Verificar que el equipamiento exista
            if (equipamientoService.findById(codEquip).isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Equipamiento no encontrado"));
            }

            // Verificar que el departamento exista
            Optional<Departamento> departamento = departamentoRepository.findAll().stream()
                    .filter(d -> d.getNombreDepartamento().equals(nombreDepartamento) && d.getIdSede().equals(idSede))
                    .findFirst();

            if (departamento.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Departamento no encontrado en la sede seleccionada"));
            }

            // Verificar si ya existe la asignación
            if (equipamientoUsaDepartamentoRepository.existsAssignment(codEquip, nombreDepartamento, idSede)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Este equipamiento ya está asignado a este departamento"));
            }

            // Crear la asignación
            EquipamientoUsaDepartamento asignacion = new EquipamientoUsaDepartamento();
            asignacion.setCodEquip(codEquip);
            asignacion.setNombreDepartamento(nombreDepartamento);
            asignacion.setIdSede(idSede);

            equipamientoUsaDepartamentoRepository.save(asignacion);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "Equipamiento asignado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al asignar equipamiento: " + e.getMessage()));
        }
    }

    /**
     * POST - Asignar un empleado al mantenimiento de un equipamiento
     */
    @PostMapping("/mantenimiento/asignar-empleado")
    public ResponseEntity<?> asignarEmpleadoMantenimiento(@RequestBody Map<String, Object> request) {
        try {
            Integer codEquip = ((Number) request.get("codEquip")).intValue();
            Integer numDocumento = ((Number) request.get("numDocumento")).intValue();
            Integer idEmpleado = ((Number) request.get("idEmpleado")).intValue();

            // Validar que el equipamiento existe
            Optional<Equipamiento> equipamiento = equipamientoService.findById(codEquip);
            if (equipamiento.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "El equipamiento no existe"));
            }

            // Validar que el empleado existe
            Optional<Empleado> empleado = empleadoRepository.findById(new com.gestion_medica.demo.model.keys.EmpleadoId(numDocumento, idEmpleado));
            if (empleado.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "El empleado no existe"));
            }

            // Verificar si ya existe la asignación
            if (empleadoMantieneEquipamientoRepository.existsAssignment(codEquip, numDocumento, idEmpleado)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Este empleado ya está asignado al mantenimiento de este equipamiento"));
            }

            // Crear la asignación
            EmpleadoMantieneEquipamiento asignacion = new EmpleadoMantieneEquipamiento();
            asignacion.setCodEquip(codEquip);
            asignacion.setNumDocumento(numDocumento);
            asignacion.setIdEmpleado(idEmpleado);

            empleadoMantieneEquipamientoRepository.save(asignacion);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "Empleado asignado al mantenimiento correctamente"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al asignar empleado: " + e.getMessage()));
        }
    }

    /**
     * GET - Obtener empleados asignados al mantenimiento de un equipamiento
     */
    @GetMapping("/{codEquip}/mantenimiento/empleados")
    public ResponseEntity<?> getEmpleadosMantenimiento(@PathVariable Integer codEquip) {
        try {
            // Validar que el equipamiento existe
            Optional<Equipamiento> equipamiento = equipamientoService.findById(codEquip);
            if (equipamiento.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "El equipamiento no existe"));
            }

            // Obtener empleados asignados
            List<EmpleadoMantieneEquipamiento> asignaciones = empleadoMantieneEquipamientoRepository.findByCodEquip(codEquip);

            List<Map<String, Object>> resultado = new ArrayList<>();
            for (EmpleadoMantieneEquipamiento asignacion : asignaciones) {
                Optional<Empleado> empleado = empleadoRepository.findById(
                        new com.gestion_medica.demo.model.keys.EmpleadoId(
                                asignacion.getNumDocumento(),
                                asignacion.getIdEmpleado()
                        )
                );

                if (empleado.isPresent()) {
                    Empleado emp = empleado.get();
                    Map<String, Object> map = new HashMap<>();
                    map.put("idEmpleado", asignacion.getIdEmpleado());
                    map.put("numDocumento", asignacion.getNumDocumento());
                    map.put("cargo", emp.getCargo());
                    
                    // Datos de la persona anidados
                    if (emp.getPersona() != null) {
                        Map<String, Object> personaMap = new HashMap<>();
                        personaMap.put("nombrePersona", emp.getPersona().getNombrePersona());
                        personaMap.put("apellidoPersona", emp.getPersona().getApellidoPersona());
                        personaMap.put("tipoDocumento", emp.getPersona().getTipoDocumento());
                        personaMap.put("genero", emp.getPersona().getGenero());
                        personaMap.put("correo", emp.getPersona().getCorreo());
                        map.put("persona", personaMap);
                    }
                    
                    map.put("codequip", codEquip);
                    resultado.add(map);
                }
            }

            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al obtener empleados: " + e.getMessage()));
        }
    }

    /**
     * DELETE - Remover un empleado del mantenimiento de un equipamiento
     */
    @DeleteMapping("/{codEquip}/mantenimiento/empleado/{numDocumento}/{idEmpleado}")
    public ResponseEntity<?> deleteEmpleadoMantenimiento(
            @PathVariable Integer codEquip,
            @PathVariable Integer numDocumento,
            @PathVariable Integer idEmpleado) {
        try {
            // Validar que el equipamiento existe
            Optional<Equipamiento> equipamiento = equipamientoService.findById(codEquip);
            if (equipamiento.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "El equipamiento no existe"));
            }

            // Buscar y eliminar la asignación
            List<EmpleadoMantieneEquipamiento> asignaciones = empleadoMantieneEquipamientoRepository.findByCodEquip(codEquip);
            for (EmpleadoMantieneEquipamiento asignacion : asignaciones) {
                if (asignacion.getNumDocumento().equals(numDocumento) &&
                    asignacion.getIdEmpleado().equals(idEmpleado)) {
                    empleadoMantieneEquipamientoRepository.delete(asignacion);
                    return ResponseEntity.ok(Map.of("message", "Empleado removido correctamente"));
                }
            }

            return ResponseEntity.badRequest()
                    .body(Map.of("error", "La asignación no existe"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al remover empleado: " + e.getMessage()));
        }
    }
}
