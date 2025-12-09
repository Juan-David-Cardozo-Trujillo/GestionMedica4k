// CORRECCIÓN 1: Puerto 8080
const API_URL = 'http://localhost:8080/api';

document.addEventListener('DOMContentLoaded', () => {
    loadDepartments();
    loadSedes();
});

async function loadDepartments() {
    try {
        const response = await fetch(`${API_URL}/departamentos`, {
            // Si no tienes login activo, comenta esta línea de headers
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const departments = await response.json();
        renderDepartments(departments);
    } catch (error) {
        console.error(error);
        showNotification('Error al cargar departamentos', 'error');
    }
}

async function loadSedes() {
    try {
        const response = await fetch(`${API_URL}/sedes`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const sedes = await response.json();
        const select = document.getElementById('idSede');
        select.innerHTML = '<option value="">Seleccione</option>';
        
        // CORRECCIÓN: Asegúrate que tu backend de Sedes devuelva 'idSede' y 'nombreSede' (camelCase)
        sedes.forEach(s => {
            select.innerHTML += `<option value="${s.idSede}">${s.nombreSede}</option>`;
        });
    } catch (error) {
        console.error('Error cargando sedes:', error);
    }
}

function renderDepartments(departments) {
    const tbody = document.getElementById('departmentsBody');
    tbody.innerHTML = '';
    
    departments.forEach(dept => {
        // CORRECCIÓN 2: Acceso seguro a objeto anidado
        // Java devuelve: { nombreDepartamento: "Urgencias", sede: { nombreSede: "Norte" } }
        const nombreSede = dept.sede ? dept.sede.nombreSede : 'N/A';
        
        tbody.innerHTML += `
            <tr>
                <td>${dept.nombreDepartamento}</td>
                <td>${nombreSede}</td>
                <td>
                    <button class="btn-icon" onclick="deleteDepartment('${dept.nombreDepartamento}', ${dept.idSede})">🗑️</button>
                </td>
            </tr>
        `;
    });
}

// ... openModal y closeModal quedan igual ...
function openModal() {
    document.getElementById('departmentModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('departmentModal').style.display = 'none';
    document.getElementById('departmentForm').reset();
}

async function saveDepartment(event) {
    event.preventDefault();
    
    const data = {
        nombreDepartamento: document.getElementById('nombreDepartamento').value,
        idSede: parseInt(document.getElementById('idSede').value)
    };
    
    try {
        const response = await fetch(`${API_URL}/departamentos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': ... (Descomentar si usas token)
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
             const errorText = await response.text();
             throw new Error(errorText);
        }
        
        showNotification('Departamento creado', 'success');
        closeModal();
        loadDepartments();
    } catch (error) {
        console.error(error);
        showNotification('Error al guardar: ' + error.message, 'error');
    }
}

async function deleteDepartment(nombre, idSede) {
    if (!confirm('¿Eliminar este departamento?')) return;
    
    try {
        // Esta URL coincide con el @DeleteMapping("/{nombre}/{idSede}") del Controller
        const response = await fetch(`${API_URL}/departamentos/${nombre}/${idSede}`, {
            method: 'DELETE',
            // headers ...
        });
        
        if (!response.ok) throw new Error('Error');
        showNotification('Departamento eliminado', 'success');
        loadDepartments();
    } catch (error) {
        showNotification('Error al eliminar', 'error');
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} show`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}