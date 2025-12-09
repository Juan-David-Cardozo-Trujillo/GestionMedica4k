package com.gestion_medica.demo.control;

import com.gestion_medica.demo.model.Persona;
import com.gestion_medica.demo.model.Usuario;
import com.gestion_medica.demo.service.PersonaService;
import com.gestion_medica.demo.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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

            response.put("success", true);
            response.put("mensaje", "Usuario creado exitosamente");
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
