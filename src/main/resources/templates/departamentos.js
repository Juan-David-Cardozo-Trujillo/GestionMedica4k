// CORRECCIÓN 1: Puerto 8080
const API_URL = 'http://localhost:8080/api';
let allSedes = [];
let currentDepartment = null;

document.addEventListener('DOMContentLoaded', () => {
    loadSedes();
    loadDepartments();
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
        allSedes = await response.json();
        const select = document.getElementById('idSede');
        select.innerHTML = '<option value="">Seleccione</option>';
        
        // Backend devuelve propiedades en minúsculas: idsede y nombresede
        allSedes.forEach(s => {
            select.innerHTML += `<option value="${s.idsede}">${s.nombresede}</option>`;
        });
    } catch (error) {
        console.error('Error cargando sedes:', error);
    }
}

function getNombreSede(idSede) {
    const sede = allSedes.find(s => s.idsede === idSede);
    return sede ? sede.nombresede : 'N/A';
}

function renderDepartments(departments) {
    const tbody = document.getElementById('departmentsBody');
    tbody.innerHTML = '';
    
    departments.forEach(dept => {
        // Backend devuelve: { nombredepartamento: "Urgencias", idsede: 1 }
        const nombreSede = getNombreSede(dept.idsede);
        
        tbody.innerHTML += `
            <tr>
                <td>${dept.nombredepartamento}</td>
                <td>${nombreSede}</td>
                <td>
                    <button class="btn-icon" onclick="deleteDepartment('${dept.nombredepartamento}', ${dept.idsede})">🗑️</button>
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

    const nombreDepartamento = document.getElementById('nombreDepartamento').value.trim();
    const idSedeValue = document.getElementById('idSede').value.trim();
    
    // Validar que los campos no estén vacíos
    if (!nombreDepartamento) {
        showNotification('El nombre del departamento es obligatorio', 'warning');
        return;
    }
    
    if (!idSedeValue) {
        showNotification('Debe seleccionar una sede', 'warning');
        return;
    }
    
    const data = {
        nombreDepartamento: nombreDepartamento,
        idSede: parseInt(idSedeValue)
    };
    
    try {
        const response = await fetch(`${API_URL}/departamentos`, {
            method: 'POST',
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

        const accion = !currentDepartment ? 'INSERT' : 'UPDATE';
        await registrarAuditoria(accion, 'departamentos');
        
        showNotification('Departamento guardado correctamente', 'success');
        closeModal();
        loadDepartments();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al guardar: ' + error.message, 'error');
    }
}

async function deleteDepartment(nombre, idSede) {
    if (!confirm('¿Eliminar este departamento?')) return;
    
    try {
        // Esta URL coincide con el @DeleteMapping("/{nombre}/{idSede}") del Controller
        const response = await fetch(`${API_URL}/departamentos/${nombre}/${idSede}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Error');

        await registrarAuditoria('DELETE', 'departamentos');

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