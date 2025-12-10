# Gestión Médica 4K

## Descripción
Gestión Médica 4K es una aplicación web desarrollada con Spring Boot y Java, diseñada para la administración integral de una clínica u hospital. Permite gestionar pacientes, citas, historias clínicas, diagnósticos, enfermedades, empleados, medicamentos y reportes, todo desde una interfaz moderna y fácil de usar.

## Características principales
- **Gestión de pacientes:** Registro, edición y consulta de pacientes y sus datos personales.
- **Citas médicas:** Programación, visualización y gestión de citas entre pacientes y médicos.
- **Historias clínicas:** Creación y consulta de historias clínicas, con registro de diagnósticos y enfermedades asociadas.
- **Diagnósticos:** Registro de diagnósticos médicos por enfermedad y cita.
- **Empleados:** Administración de médicos y personal de la clínica.
- **Medicamentos:** Gestión de medicamentos disponibles y su relación con diagnósticos.
- **Reportes:** Generación de reportes administrativos y médicos.
- **Seguridad:** Acceso por roles (paciente, médico, administrador) y autenticación de usuarios.

## Estructura del proyecto
- **Backend:**
  - Spring Boot (Java 21)
  - Controladores REST para cada entidad
  - Conexión a base de datos PostgreSQL
  - Entidades: Paciente, Cita, Historia Clínica, Diagnóstico, Enfermedad, Empleado, Medicamento
- **Frontend:**
  - HTML, CSS y JavaScript
  - Archivos JS para cada módulo (dashboard, historias clínicas, citas, etc.)
  - Plantillas HTML para cada vista principal

## Instalación y ejecución
1. Clona el repositorio:
   ```
   git clone https://github.com/Juan-David-Cardozo-Trujillo/GestionMedica4k.git
   ```
2. Configura la base de datos PostgreSQL y actualiza `application.properties` con tus credenciales.
3. Compila y ejecuta el backend:
   ```
   .\mvnw.cmd clean spring-boot:run
   ```
4. Accede a la aplicación desde tu navegador en `http://localhost:8080`.

## Uso
- Ingresa con tu usuario y contraseña según el rol asignado.
- Los pacientes pueden ver sus citas, diagnósticos y su historia clínica.
- Los médicos pueden registrar diagnósticos y gestionar historias clínicas.
- Los administradores pueden gestionar empleados, reportes y toda la información del sistema.

## Estructura de carpetas
- `src/main/java/com/gestion_medica/` - Código fuente backend
- `src/main/resources/static/` - Archivos estáticos (JS, CSS)
- `src/main/resources/templates/` - Plantillas HTML
- `src/test/java/` - Pruebas unitarias

## Créditos
Desarrollado por Juan David Cardozo Trujillo y colaboradores.

## Licencia
Este proyecto es de uso académico y libre para modificar y mejorar.