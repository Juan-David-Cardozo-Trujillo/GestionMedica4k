const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    loadDepartments();
    loadSedes();
});

async function loadDepartments() {
    try {
        const response = await fetch(`${API_URL}/departamentos`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const departments = await response.json();
        renderDepartments(departments);
    } catch (error) {
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
        sedes.forEach(s => {
            select.innerHTML += `<option value="${s.idsede}">${s.nombresede}</option>`;
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

function renderDepartments(departments) {
    const tbody = document.getElementById('departmentsBody');
    tbody.innerHTML = '';
    
    departments.forEach(dept => {
        tbody.innerHTML += `
            <tr>
                <td>${dept.nombredepartamento}</td>
                <td>${dept.nombresede || 'N/A'}</td>
                <td>
                    <button class="btn-icon" onclick="deleteDepartment('${dept.nombredepartamento}', ${dept.idsede})">🗑️</button>
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
    
    const data = {
        nombreDepartamento: document.getElementById('nombreDepartamento').value,
        idSede: parseInt(document.getElementById('idSede').value)
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
        
        if (!response.ok) throw new Error('Error');
        showNotification('Departamento creado', 'success');
        closeModal();
        loadDepartments();
    } catch (error) {
        showNotification('Error al guardar', 'error');
    }
}

async function deleteDepartment(nombre, idSede) {
    if (!confirm('¿Eliminar este departamento?')) return;
    
    try {
        const response = await fetch(`${API_URL}/departamentos/${nombre}/${idSede}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
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