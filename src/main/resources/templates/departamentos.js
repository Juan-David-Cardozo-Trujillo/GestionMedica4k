// departamentos.js - CORREGIDO
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
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const departments = await response.json();
        console.log('✅ Departamentos cargados:', departments); // Debug
        renderDepartments(departments);
    } catch (error) {
        console.error('❌ Error al cargar departamentos:', error);
        showNotification('Error al cargar departamentos', 'error');
    }
}

async function loadSedes() {
    try {
        const response = await fetch(`${API_URL}/sedes`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        allSedes = await response.json();
        console.log('✅ Sedes cargadas:', allSedes); // Debug
        
        const select = document.getElementById('idSede');
        select.innerHTML = '<option value="">Seleccione</option>';
        
        // ✅ CORRECCIÓN: Usar camelCase consistente
        allSedes.forEach(s => {
            select.innerHTML += `<option value="${s.idSede}">${s.nombreSede}</option>`;
        });
    } catch (error) {
        console.error('❌ Error cargando sedes:', error);
    }
}

function getNombreSede(idSede) {
    // ✅ CORRECCIÓN: Usar camelCase
    const sede = allSedes.find(s => s.idSede === idSede);
    return sede ? sede.nombreSede : 'N/A';
}

function renderDepartments(departments) {
    const tbody = document.getElementById('departmentsBody');
    tbody.innerHTML = '';
    
    if (departments.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="3" style="text-align:center; padding:40px;">
                No hay departamentos registrados
            </td></tr>
        `;
        return;
    }
    
    departments.forEach(dept => {
        // ✅ CORRECCIÓN: Usar camelCase consistente
        const nombreSede = dept.nombreSede || getNombreSede(dept.idSede);
        
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
             const errorData = await response.json();
             throw new Error(errorData.error || 'Error al guardar');
        }

        const accion = !currentDepartment ? 'INSERT' : 'UPDATE';
        await registrarAuditoria(accion, 'departamentos');
        
        showNotification('Departamento guardado correctamente', 'success');
        closeModal();
        loadDepartments();
    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('Error al guardar: ' + error.message, 'error');
    }
}

async function deleteDepartment(nombre, idSede) {
    if (!confirm('¿Eliminar este departamento?')) return;
    
    try {
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
        console.error('❌ Error al eliminar:', error);
        showNotification('Error al eliminar', 'error');
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} show`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}