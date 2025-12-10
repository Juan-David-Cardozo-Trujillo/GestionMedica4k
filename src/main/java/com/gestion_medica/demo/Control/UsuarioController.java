package com.gestion_medica.demo.Control;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.gestion_medica.demo.model.Paciente;
import com.gestion_medica.demo.model.Persona;
import com.gestion_medica.demo.model.Usuario;
import com.gestion_medica.demo.service.EmpleadoService;
import com.gestion_medica.demo.service.PacienteService;
import com.gestion_medica.demo.service.PersonaService;
import com.gestion_medica.demo.service.UsuarioService;

@RestController
@RequestMapping("/api/usuarios")
// Configuración CORS específica para este controller
@CrossOrigin(
        origins = {
            "http://localhost:8080",
            "http://127.0.0.1:8080",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:5500",
            "http://127.0.0.1:5500"
        },
        methods = {
            RequestMethod.GET,
            RequestMethod.POST,
            RequestMethod.PUT,
            RequestMethod.DELETE,
            RequestMethod.OPTIONS
        },
        allowedHeaders = "*",
        allowCredentials = "true",
        maxAge = 3600
)
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private PersonaService personaService;

    @Autowired
    private PacienteService pacienteService;

    @Autowired
    private EmpleadoService empleadoService;

    /**
     * Obtener todos los usuarios
     */
    @GetMapping
    public ResponseEntity<List<Usuario>> getAllUsuarios() {
        List<Usuario> usuarios = usuarioService.findAll();
        return ResponseEntity.ok(usuarios);
    }

    /**
     * Obtener un usuario por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> getUsuarioById(@PathVariable Integer id) {
        Optional<Usuario> usuario = usuarioService.findById(id);
        return usuario.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Crear un nuevo usuarioq
     */
    @PostMapping("/crear")
    public ResponseEntity<Map<String, Object>> createUsuario(@RequestBody Map<String, Object> data) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Extraer datos de persona
            Map<String, Object> personaData = (Map<String, Object>) data.get("persona");

            // Crear o buscar persona
            Integer numDocumento = (Integer) personaData.get("numDocumento");
            Persona persona;

            Optional<Persona> personaExistente = personaService.findById(numDocumento);
            if (personaExistente.isPresent()) {
                persona = personaExistente.get();
            } else {

                persona = new Persona();
                persona.setNumDocumento(numDocumento);
                persona.setTipoDocumento((String) personaData.get("tipoDocumento"));
                persona.setNombrePersona((String) personaData.get("nombrePersona"));
                persona.setApellidoPersona((String) personaData.get("apellidoPersona"));
                persona.setGenero((String) personaData.get("genero"));
                persona.setFechaNacimiento(java.sql.Date.valueOf((String) personaData.get("fechaNacimiento")));
                persona.setCorreo((String) personaData.get("correo"));
                personaService.save(persona);
            }

            // Extraer datos de usuario
            Map<String, Object> usuarioData = (Map<String, Object>) data.get("usuario");

            // Validar que la contraseña esté presente
            String contrasena = (String) usuarioData.get("contrasenaEncriptada");
            if (contrasena == null || contrasena.trim().isEmpty()) {
                response.put("success", false);
                response.put("mensaje", "La contraseña es requerida");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            Usuario usuario = new Usuario();
            usuario.setNombreUsuario((String) usuarioData.get("nombreUsuario"));
            usuario.setContrasenaEncriptada(contrasena);
            usuario.setRol((String) usuarioData.get("rol"));
            usuario.setPersona(persona);

            Usuario savedUsuario = usuarioService.save(usuario);

            // Si el rol es Paciente, crear automáticamente el registro en la tabla pacientes
            String rol = (String) usuarioData.get("rol");
            if ("Paciente".equalsIgnoreCase(rol)) {
                String direccion = (String) data.get("direccion");
                
                if (direccion == null || direccion.trim().isEmpty()) {
                    response.put("success", false);
                    response.put("mensaje", "La dirección es requerida para pacientes");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                }
                
                Paciente paciente = new Paciente();
                paciente.setNumDocumento(persona.getNumDocumento());
                paciente.setDirPaciente(direccion);
                paciente.setPersona(persona);
                
                pacienteService.save(paciente);
                
                response.put("paciente", paciente);
                response.put("mensaje", "Usuario paciente creado exitosamente. Ya puede iniciar sesión.");
            }

            // Si el rol es Medico, crear automáticamente el registro en la tabla empleados
            if ("Medico".equalsIgnoreCase(rol) || "Médico".equalsIgnoreCase(rol)) {
                // Recibir datos del departamento desde el frontend
                String cargo = "Medico"; // cargo estándar
                String nombreDepartamento = null;
                Integer idSede = null;

                // Intentar obtener departamento e idSede del request
                if (data.containsKey("nombreDepartamento")) {
                    nombreDepartamento = data.get("nombreDepartamento").toString();
                }
                if (data.containsKey("idSede")) {
                    try {
                        idSede = Integer.valueOf(data.get("idSede").toString());
                    } catch (NumberFormatException e) {
                        System.out.println("Error convirtiendo idSede: " + e.getMessage());
                    }
                }

                try {
                    System.out.println("=== INTENTANDO CREAR EMPLEADO ===");
                    System.out.println("Persona numDocumento: " + persona.getNumDocumento());
                    System.out.println("Cargo: " + cargo);
                    System.out.println("Departamento: " + nombreDepartamento);
                    System.out.println("IdSede: " + idSede);
                    
                    // Registrar Persona ya creada + Empleado con departamento
                    com.gestion_medica.demo.model.Empleado empleadoCreado = empleadoService
                        .registrarEmpleadoSinDTO(persona, cargo, nombreDepartamento, idSede);
                    
                    System.out.println("=== EMPLEADO CREADO EXITOSAMENTE ===");
                    System.out.println("IdEmpleado: " + empleadoCreado.getIdEmpleado());
                    
                    response.put("empleado", empleadoCreado);
                    // Mensaje complementario si no se había definido
                    if (response.get("mensaje") == null) {
                        response.put("mensaje", "Usuario médico creado exitosamente y vinculado como empleado.");
                    }
                } catch (Exception ex) {
                    // No romper la creación de usuario si falla la creación de empleado
                    System.err.println("=== ERROR AL CREAR EMPLEADO ===");
                    ex.printStackTrace();
                    response.put("empleadoError", "No se pudo crear el empleado vinculado: " + ex.getMessage());
                    response.put("empleadoErrorDetalle", ex.getClass().getName());
                }
            }

            response.put("success", true);
            if (response.get("mensaje") == null) {
                response.put("mensaje", "Usuario creado exitosamente");
            }
            response.put("usuario", savedUsuario);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("mensaje", "Error al crear usuario: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Actualizar un usuario existente
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateUsuario(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> data) {

        Map<String, Object> response = new HashMap<>();

        try {
            Optional<Usuario> usuarioExistente = usuarioService.findById(id);

            if (usuarioExistente.isEmpty()) {
                response.put("success", false);
                response.put("mensaje", "Usuario no encontrado");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            Usuario usuario = usuarioExistente.get();

            // Actualizar datos de persona si están presentes
            if (data.containsKey("persona")) {
                Map<String, Object> personaData = (Map<String, Object>) data.get("persona");
                Optional<Persona> personaOpt = personaService.findById(usuario.getPersona().getNumDocumento());

                if (personaOpt.isPresent()) {
                    Persona persona = personaOpt.get();

                    if (personaData.containsKey("nombrePersona")) {
                        persona.setNombrePersona((String) personaData.get("nombrePersona"));
                    }
                    if (personaData.containsKey("apellidoPersona")) {
                        persona.setApellidoPersona((String) personaData.get("apellidoPersona"));
                    }
                    if (personaData.containsKey("correo")) {
                        persona.setCorreo((String) personaData.get("correo"));
                    }
                    if (personaData.containsKey("genero")) {
                        persona.setGenero((String) personaData.get("genero"));
                    }
                    if (personaData.containsKey("fechaNacimiento")) {
                        persona.setFechaNacimiento(java.sql.Date.valueOf((String) personaData.get("fechaNacimiento")));
                    }

                    personaService.save(persona);
                }
            }

            // Actualizar datos de usuario
            if (data.containsKey("usuario")) {
                Map<String, Object> usuarioData = (Map<String, Object>) data.get("usuario");

                if (usuarioData.containsKey("nombreUsuario")) {
                    usuario.setNombreUsuario((String) usuarioData.get("nombreUsuario"));
                }
                if (usuarioData.containsKey("rol")) {
                    usuario.setRol((String) usuarioData.get("rol"));
                }
                if (usuarioData.containsKey("contrasenaEncriptada")
                        && !((String) usuarioData.get("contrasenaEncriptada")).isEmpty()) {
                    usuario.setContrasenaEncriptada((String) usuarioData.get("contrasenaEncriptada"));
                }
            }

            Usuario updatedUsuario = usuarioService.save(usuario);

            response.put("success", true);
            response.put("mensaje", "Usuario actualizado exitosamente");
            response.put("usuario", updatedUsuario);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("mensaje", "Error al actualizar usuario: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Eliminar un usuario
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteUsuario(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();

        try {
            Optional<Usuario> usuario = usuarioService.findById(id);

            if (usuario.isEmpty()) {
                response.put("success", false);
                response.put("mensaje", "Usuario no encontrado");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            usuarioService.deleteById(id);

            response.put("success", true);
            response.put("mensaje", "Usuario eliminado exitosamente");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("mensaje", "Error al eliminar usuario: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
