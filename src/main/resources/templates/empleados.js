const API_URL = 'http://localhost:3000/api';
let currentEmployee = null;
let allEmployees = [];
let sedes = [];
let departamentos = [];

document.addEventListener('DOMContentLoaded', () => {
    loadEmployees();
    loadSedes();
});

async function loadEmployees() {
    try {
        const response = await fetch(`${API_URL}/empleados`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        allEmployees = await response.json();
        renderEmployees(allEmployees);
    } catch (error) {
        console.error('Error:', error);
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
    } catch (error) {
        console.error('Error:', error);
    }
}

async function loadDepartamentos(idSede) {
    try {
        const response = await fetch(`${API_URL}/departamentos?idSede=${idSede}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        departamentos = await response.json();
        populateDepartamentoSelect();
    } catch (error) {
        console.error('Error:', error);
    }
}

function populateSedeSelect() {
    const select = document.getElementById('idSede');
    select.innerHTML = '<option value="">Seleccione</option>';
    sedes.forEach(sede => {
        select.innerHTML += `<option value="${sede.idsede}">${sede.nombresede}</option>`;
    });
    
    select.onchange = function() {
        if (this.value) {
            loadDepartamentos(this.value);
        }
    };
}

function populateDepartamentoSelect() {
    const select = document.getElementById('nombreDepartamento');
    select.innerHTML = '<option value="">Seleccione</option>';
    departamentos.forEach(dept => {
        select.innerHTML += `<option value="${dept.nombredepartamento}">${dept.nombredepartamento}</option>`;
    });
}

function renderEmployees(employees) {
    const tbody = document.getElementById('employeesBody');
    tbody.innerHTML = '';
    
    employees.forEach(emp => {
        tbody.innerHTML += `
            <tr>
                <td>${emp.idempleado}</td>
                <td>${emp.nombrepersona} ${emp.apellidopersona}</td>
                <td>${emp.tipodocumento} ${emp.numdocumento}</td>
                <td>${emp.cargo}</td>
                <td>${emp.nombredepartamento}</td>
                <td>${emp.nombresede || 'N/A'}</td>
                <td>
                    <button class="btn-icon" onclick='editEmployee(${JSON.stringify(emp)})'>✏️</button>
                    <button class="btn-icon" onclick="deleteEmployee(${emp.idempleado}, ${emp.numdocumento})">🗑️</button>
                </td>
            </tr>
        `;
    });
}

function openModal(employee = null) {
    const modal = document.getElementById('employeeModal');
    const form = document.getElementById('employeeForm');
    
    if (employee) {
        currentEmployee = employee;
        document.getElementById('modalTitle').textContent = 'Editar Empleado';
        document.getElementById('numDocumento').value = employee.numdocumento;
        document.getElementById('nombrePersona').value = employee.nombrepersona;
        document.getElementById('apellidoPersona').value = employee.apellidopersona;
        document.getElementById('tipoDocumento').value = employee.tipodocumento;
        document.getElementById('genero').value = employee.genero;
        document.getElementById('fechaNacimiento').value = employee.fechanacimiento;
        document.getElementById('correo').value = employee.correo;
        document.getElementById('cargo').value = employee.cargo;
        document.getElementById('idSede').value = employee.idsede;
        loadDepartamentos(employee.idsede).then(() => {
            document.getElementById('nombreDepartamento').value = employee.nombredepartamento;
        });
    } else {
        currentEmployee = null;
        form.reset();
        document.getElementById('modalTitle').textContent = 'Nuevo Empleado';
    }
    
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('employeeModal').style.display = 'none';
}

async function saveEmployee(event) {
    event.preventDefault();
    
    const data = {
        persona: {
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
        const url = currentEmployee 
            ? `${API_URL}/empleados/${currentEmployee.idempleado}`
            : `${API_URL}/empleados`;
        const method = currentEmployee ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Error al guardar');
        
        showNotification('Empleado guardado correctamente', 'success');
        closeModal();
        loadEmployees();
    } catch (error) {
        showNotification('Error al guardar empleado', 'error');
    }
}

function editEmployee(employee) {
    openModal(employee);
}

async function deleteEmployee(idEmpleado, numDocumento) {
    if (!confirm('¿Eliminar este empleado?')) return;
    
    try {
        const response = await fetch(`${API_URL}/empleados/${idEmpleado}?numDocumento=${numDocumento}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (!response.ok) throw new Error('Error');
        showNotification('Empleado eliminado', 'success');
        loadEmployees();
    } catch (error) {
        showNotification('Error al eliminar', 'error');
    }
}

function filterEmployees() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const cargo = document.getElementById('filterCargo').value;
    const sede = document.getElementById('filterSede').value;
    
    const filtered = allEmployees.filter(emp => {
        const matchSearch = emp.nombrepersona.toLowerCase().includes(search) ||
                          emp.apellidopersona.toLowerCase().includes(search);
        const matchCargo = !cargo || emp.cargo === cargo;
        const matchSede = !sede || emp.idsede == sede;
        return matchSearch && matchCargo && matchSede;
    });
    
    renderEmployees(filtered);
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} show`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 3000);
}