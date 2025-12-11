const API_URL = 'http://localhost:8080/api'; // Puerto correcto 8080
let currentDisease = null;
let allDiseases = [];

document.addEventListener('DOMContentLoaded', () => {
    checkPermissions();
    loadDiseases();
});

function checkPermissions() {
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'Medico') {
        const btn = document.querySelector('button[onclick="openModal()"]');
        if (btn) btn.style.display = 'none';

        // Ocultar columna de acciones en la tabla
        // Esto requiere cambiar cómo se renderiza la tabla también
    }
}

async function loadDiseases() {
    try {
        const response = await fetch(`${API_URL}/enfermedades`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        allDiseases = await response.json();

        renderDiseases(allDiseases);
        await registrarAuditoria('SELECT', 'enfermedades');
    } catch (error) {
        console.error(error);
        showNotification('Error al cargar enfermedades', 'error');
    }
}

function renderDiseases(diseases) {
    const tbody = document.getElementById('diseasesBody');
    tbody.innerHTML = '';

    const userRole = localStorage.getItem('userRole');

    const actionsHeader = document.getElementById('actionsHeader');
    if (userRole === 'Medico') {
        if (actionsHeader) actionsHeader.style.display = 'none';
    } else {
        if (actionsHeader) actionsHeader.style.display = '';
    }

    diseases.forEach(disease => {
        let acciones = '';
        let actionsCell = '';

        if (userRole !== 'Medico') {
            acciones = `
                <button class="btn-icon" onclick='editDisease(${JSON.stringify(disease)})'>✏️</button>
                <button class="btn-icon" onclick="deleteDisease(${disease.idEnfermedad})">🗑️</button>
            `;
            actionsCell = `<td>${acciones}</td>`;
        }

        // Si es médico, no mostramos la celda de acciones en absoluto

        tbody.innerHTML += `
            <tr>
                <td>${disease.idEnfermedad}</td>
                <td>${disease.nombreEnfermedad}</td>
                <td>${disease.descripcionEnfermedad}</td>
                ${actionsCell}
            </tr>
        `;
    });
}

function openModal(disease = null) {
    const modal = document.getElementById('diseaseModal');
    const form = document.getElementById('diseaseForm');

    if (disease) {
        currentDisease = disease;
        document.getElementById('modalTitle').textContent = 'Editar Enfermedad';
        // CORRECCIÓN: camelCase aquí también para llenar el form
        document.getElementById('nombreEnfermedad').value = disease.nombreEnfermedad;
        document.getElementById('descripcionEnfermedad').value = disease.descripcionEnfermedad;
    } else {
        currentDisease = null;
        document.getElementById('modalTitle').textContent = 'Nueva Enfermedad';
        form.reset();
    }

    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('diseaseModal').style.display = 'none';
}

async function saveDisease(event) {
    event.preventDefault();

    const esNuevo = !currentDisease; // Determinar si es INSERT o UPDATE

    const data = {
        // Estos nombres deben coincidir con los atributos en Enfermedad.java
        nombreEnfermedad: document.getElementById('nombreEnfermedad').value,
        descripcionEnfermedad: document.getElementById('descripcionEnfermedad').value
    };

    try {
        // CORRECCIÓN: Usamos idEnfermedad (camelCase)
        const url = currentDisease
            ? `${API_URL}/enfermedades/${currentDisease.idEnfermedad}`
            : `${API_URL}/enfermedades`;

        const method = currentDisease ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error('Error');

        const accion = esNuevo ? 'INSERT' : 'UPDATE';
        await registrarAuditoria(accion, 'enfermedades');

        showNotification('Enfermedad guardada', 'success');
        closeModal();
        loadDiseases();
    } catch (error) {
        console.error(error);
        showNotification('Error al guardar', 'error');
    }
}

function editDisease(disease) {
    openModal(disease);
}

async function deleteDisease(id) {
    if (!confirm('¿Eliminar esta enfermedad?')) return;

    try {
        const response = await fetch(`${API_URL}/enfermedades/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (!response.ok) throw new Error('Error');

        await registrarAuditoria('DELETE', 'enfermedades');

        showNotification('Enfermedad eliminada', 'success');
        loadDiseases();
    } catch (error) {
        showNotification('Error al eliminar', 'error');
    }
}

function filterDiseases() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allDiseases.filter(d =>
        // CORRECCIÓN: camelCase para el filtrado
        d.nombreEnfermedad.toLowerCase().includes(search) ||
        d.descripcionEnfermedad.toLowerCase().includes(search)
    );
    renderDiseases(filtered);
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} show`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}