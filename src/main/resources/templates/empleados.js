const API_URL = 'http://localhost:8080/api';

let currentEmployee = null;
let allEmployees = [];
let sedes = [];
let departamentos = [];

document.addEventListener('DOMContentLoaded', () => {
    loadEmployees();
    loadSedes();
});

// --- CARGA DE DATOS ---

async function loadEmployees() {
    try {
        const response = await fetch(`${API_URL}/empleados`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Error de red');
        allEmployees = await response.json();
        renderEmployees(allEmployees);
    } catch (error) {
        console.error(error);
        showNotification('Error al cargar empleados', 'error');
    }
}

async function loadSedes() {
    try {
        const response = await fetch(`${API_URL}/sedes`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        sedes = await response.json();
        populateSedeSelect();
        populateFilterSedeSelect();
    } catch (error) {
        console.error('Error:', error);
    }
}

// CORREGIDO
async function loadDepartamentos(idSede) {
    try {
        const response = await fetch(`${API_URL}/departamentos`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const allDepts = await response.json();
        
       
        departamentos = allDepts.filter(d => d.idSede == idSede);
        
        populateDepartamentoSelect();
    } catch (error) {
        console.error('Error:', error);
    }
}

// --- RENDERIZADO Y SELECTS ---

// CORREGIDO
function populateSedeSelect() {
    const select = document.getElementById('idSede');
    select.innerHTML = '<option value="">Seleccione</option>';
    
    sedes.forEach(sede => {
        
        select.innerHTML += `<option value="${sede.idSede}">${sede.nombreSede}</option>`;
    });
    
    select.onchange = function() {
        if (this.value) {
            loadDepartamentos(this.value);
        } else {
            document.getElementById('nombreDepartamento').innerHTML = '';
        }
    };
}

// CORREGIDO
function populateDepartamentoSelect() {
    const select = document.getElementById('nombreDepartamento');
    select.innerHTML = '<option value="">Seleccione</option>';
    departamentos.forEach(dept => {
        
        select.innerHTML += `<option value="${dept.nombreDepartamento}">${dept.nombreDepartamento}</option>`;
    });
}

// CORREGIDO
function populateFilterSedeSelect() {
    const select = document.getElementById('filterSede');
    select.innerHTML = '<option value="">Todas las sedes</option>';
    sedes.forEach(sede => {
       
        select.innerHTML += `<option value="${sede.idSede}">${sede.nombreSede}</option>`;
    });
}

function renderEmployees(employees) {
    const tbody = document.getElementById('employeesBody');
    tbody.innerHTML = '';
    
    employees.forEach(emp => {
        // VALIDACIÓN DE NULOS Y CAMEL CASE
        // Java devuelve: { persona: { nombrePersona: "..." }, numDocumento: 123 }
        const nombre = emp.persona ? emp.persona.nombrePersona : '---';
        const apellido = emp.persona ? emp.persona.apellidoPersona : '';
        const tipoDoc = emp.persona ? emp.persona.tipoDocumento : '';
        const numDoc = emp.numDocumento; // Propiedad directa del empleado (D mayúscula)

        // Departamento
        const deptoNombre = emp.departamento ? emp.departamento.nombredepartamento : '---';
        const sedeId = emp.departamento ? emp.departamento.idsede : '---';

        // Buscamos el nombre de la sede usando el ID para mostrarlo bonito (opcional)
        const sedeNombreObj = sedes.find(s => s.idsede === sedeId);
        const sedeNombre = sedeNombreObj ? sedeNombreObj.nombresede : sedeId;

        tbody.innerHTML += `
            <tr>
                <td>${emp.idEmpleado}</td>
                <td>${nombre} ${apellido}</td>
                <td>${tipoDoc} ${numDoc}</td>
                <td>${emp.cargo}</td>
                <td>${deptoNombre}</td>
                <td>${sedeNombre}</td>
                <td>
                    <button class="btn-icon" onclick="editEmployee(${emp.idEmpleado}, ${emp.numDocumento})">✏️</button>
                    <button class="btn-icon" onclick="deleteEmployee(${emp.idEmpleado}, ${emp.numDocumento})">🗑️</button>
                </td>
            </tr>
        `;
    });
}

// --- MODALES Y FORMULARIO ---

function openModal(employee = null) {
    const modal = document.getElementById('employeeModal');
    const form = document.getElementById('employeeForm');
    
    if (employee) {
        currentEmployee = employee;
        document.getElementById('modalTitle').textContent = 'Editar Empleado';
        
        // Llenar datos de Persona (usando camelCase)
        if (employee.persona) {
            document.getElementById('numDocumento').value = employee.numDocumento;
            document.getElementById('nombrePersona').value = employee.persona.nombrePersona;
            document.getElementById('apellidoPersona').value = employee.persona.apellidoPersona;
            document.getElementById('tipoDocumento').value = employee.persona.tipoDocumento;
            document.getElementById('genero').value = employee.persona.genero;
            document.getElementById('fechaNacimiento').value = employee.persona.fechaNacimiento;
            document.getElementById('correo').value = employee.persona.correo;
        }

        // Llenar datos de Empleado
        document.getElementById('cargo').value = employee.cargo;
        
        // Lógica para cargar Sede y Departamento en cascada
        if (employee.departamento) {
            const idSede = employee.departamento.idsede;
            document.getElementById('idSede').value = idSede;
            
            // Cargar departamentos de esa sede y luego seleccionar el correcto
            loadDepartamentos(idSede).then(() => {
                document.getElementById('nombreDepartamento').value = employee.departamento.nombreDepartamento;
            });
        }
    } else {
        currentEmployee = null;
        form.reset();
        document.getElementById('modalTitle').textContent = 'Nuevo Empleado';
        document.getElementById('nombreDepartamento').innerHTML = ''; // Limpiar depto
    }
    
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('employeeModal').style.display = 'none';
}

function editEmployee(idEmpleado, numDocumento) {
    // Buscamos el empleado en la lista local para evitar errores de sintaxis en el HTML
    const employee = allEmployees.find(e => e.idEmpleado === idEmpleado && e.numDocumento === numDocumento);
    if (employee) {
        openModal(employee);
    }
}

async function saveEmployee(event) {
    event.preventDefault();

    const esNuevo = !currentEmployee; // Determinar si es INSERT o UPDATE
    
    // Recogemos los datos del formulario
    const data = {
        persona: {
            // Nota: numDocumento lo leemos del form, pero si es edición, el backend usará el de la URL
            numDocumento: parseInt(document.getElementById('numDocumento').value),
            nombrePersona: document.getElementById('nombrePersona').value,
            apellidoPersona: document.getElementById('apellidoPersona').value,
            tipoDocumento: document.getElementById('tipoDocumento').value,
            genero: document.getElementById('genero').value,
            fechaNacimiento: document.getElementById('fechaNacimiento').value,
            correo: document.getElementById('correo').value
        },
        empleado: {
            cargo: document.getElementById('cargo').value,
            idSede: parseInt(document.getElementById('idSede').value),
            nombreDepartamento: document.getElementById('nombreDepartamento').value
        }
    };
    
    try {
        let url, method;

        // LÓGICA CLAVE: ¿Existe currentEmployee?
        if (currentEmployee) {
            // MODO EDICIÓN (PUT)
            // Usamos los IDs originales guardados en currentEmployee para la URL
            url = `${API_URL}/empleados/${currentEmployee.idEmpleado}?numDocumento=${currentEmployee.numDocumento}`;
            method = 'PUT';
        } else {
            // MODO CREACIÓN (POST)
            url = `${API_URL}/empleados`;
            method = 'POST';
        }
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        const accion = esNuevo ? 'INSERT' : 'UPDATE';
        await registrarAuditoria(accion, 'empleados');
        
        showNotification(currentEmployee ? 'Empleado actualizado' : 'Empleado creado', 'success');
        closeModal();
        loadEmployees();
    } catch (error) {
        console.error(error);
        showNotification('Error: ' + error.message, 'error');
    }
}

// --- BORRADO Y FILTROS ---

async function deleteEmployee(idEmpleado, numDocumento) {
    if (!confirm('¿Eliminar este empleado?')) return;
    
    try {
        // La URL coincide con @DeleteMapping("/{idEmpleado}") y @RequestParam("numDocumento")
        const response = await fetch(`${API_URL}/empleados/${idEmpleado}?numDocumento=${numDocumento}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (!response.ok) {
             const errorText = await response.text();
             throw new Error(errorText);
        }

        await registrarAuditoria('DELETE', 'empleados');

        showNotification('Empleado eliminado', 'success');
        loadEmployees();
    } catch (error) {
        console.error(error);
        showNotification('Error al eliminar: ' + error.message, 'error');
    }
}

function filterEmployees() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const cargo = document.getElementById('filterCargo').value;
    const sede = document.getElementById('filterSede').value;
    
    const filtered = allEmployees.filter(emp => {
        // 1. Extraer datos de forma segura (validando nulos)
        // OJO: Usar camelCase (nombrePersona) tal como viene del backend
        const nombre = emp.persona ? emp.persona.nombrePersona.toLowerCase() : '';
        const apellido = emp.persona ? emp.persona.apellidoPersona.toLowerCase() : '';
        const empSedeId = emp.departamento ? emp.departamento.idSede : '';
        const numDoc = emp.numDocumento ? emp.numDocumento.toString() : '';

        // 2. Lógica de coincidencia
        // Buscamos por Nombre, Apellido O Número de Documento
        const matchSearch = nombre.includes(search) || 
                          apellido.includes(search) || 
                          numDoc.includes(search);

        const matchCargo = !cargo || emp.cargo === cargo;
        
        // El filtro de sede compara IDs (convertimos a string para asegurar)
        const matchSede = !sede || empSedeId.toString() === sede.toString();
        
        return matchSearch && matchCargo && matchSede;
    });
    
    renderEmployees(filtered);
}

async function registrarAuditoria(accion, tabla) {
    try {
        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
        
        await fetch(`${API_URL}/auditoria/registrar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                accion: accion,
                tabla: tabla,
                ipOrigen: 'Web-Client',
                idUsuario: usuario.idUsuario || null
            })
        });
    } catch (error) {
        console.error('Error al registrar auditoría:', error);
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} show`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

