// personas.js
const API_URL = 'http://localhost:8080';
let currentPersona = null;
let allPersonas = [];

document.addEventListener('DOMContentLoaded', () => {
    loadPersonas();
});

async function loadPersonas() {
    try {
        const response = await fetch(`${API_URL}/api/personas`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (!response.ok) throw new Error('Error al cargar');
        
        allPersonas = await response.json();
        renderPersonas(allPersonas);
        updateStats();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al cargar personas', 'error');
    }
}

function renderPersonas(personas) {
    const tbody = document.getElementById('personasBody');
    tbody.innerHTML = '';
    
    if (personas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:40px;">
            No hay personas registradas</td></tr>`;
        return;
    }
    
    personas.forEach(p => {
        const edad = calcularEdad(p.fechanacimiento);
        tbody.innerHTML += `
            <tr>
                <td>${p.numdocumento}</td>
                <td>${p.tipodocumento}</td>
                <td>${p.nombrepersona} ${p.apellidopersona}</td>
                <td>${p.genero === 'M' ? 'Masculino' : 'Femenino'}</td>
                <td>${new Date(p.fechanacimiento).toLocaleDateString('es-ES')}</td>
                <td>${edad} años</td>
                <td>${p.correo}</td>
                <td>
                    <button class="btn-icon" onclick='editPersona(${JSON.stringify(p)})'>✏️</button>
                    <button class="btn-icon" onclick="deletePersona(${p.numdocumento})">🗑️</button>
                </td>
            </tr>
        `;
    });
}

function calcularEdad(fechaNacimiento) {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
}

function updateStats() {
    document.getElementById('totalPersonas').textContent = allPersonas.length;
    document.getElementById('totalMasculino').textContent = 
        allPersonas.filter(p => p.genero === 'M').length;
    document.getElementById('totalFemenino').textContent = 
        allPersonas.filter(p => p.genero === 'F').length;
}

function openModal(persona = null) {
    const modal = document.getElementById('personaModal');
    const form = document.getElementById('personaForm');
    
    if (persona) {
        document.getElementById('modalTitle').textContent = 'Editar Persona';
        currentPersona = persona;
        document.getElementById('tipoDocumento').value = persona.tipodocumento;
        document.getElementById('numDocumento').value = persona.numdocumento;
        document.getElementById('numDocumento').disabled = true;
        document.getElementById('nombrePersona').value = persona.nombrepersona;
        document.getElementById('apellidoPersona').value = persona.apellidopersona;
        document.getElementById('genero').value = persona.genero;
        document.getElementById('fechaNacimiento').value = persona.fechanacimiento;
        document.getElementById('correo').value = persona.correo;
    } else {
        document.getElementById('modalTitle').textContent = 'Nueva Persona';
        currentPersona = null;
        form.reset();
        document.getElementById('numDocumento').disabled = false;
    }
    
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('personaModal').style.display = 'none';
}

async function savePersona(event) {
    event.preventDefault();
    
    const data = {
        numDocumento: parseInt(document.getElementById('numDocumento').value),
        tipoDocumento: document.getElementById('tipoDocumento').value,
        nombrePersona: document.getElementById('nombrePersona').value.trim(),
        apellidoPersona: document.getElementById('apellidoPersona').value.trim(),
        genero: document.getElementById('genero').value,
        fechaNacimiento: document.getElementById('fechaNacimiento').value,
        correo: document.getElementById('correo').value.trim()
    };
    
    try {
        const url = currentPersona 
            ? `${API_URL}/api/personas/${currentPersona.numdocumento}`
            : `${API_URL}/api/personas`;
        const method = currentPersona ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Error al guardar');
        
        showNotification('Persona guardada correctamente', 'success');
        closeModal();
        loadPersonas();
    } catch (error) {
        showNotification('Error al guardar persona', 'error');
    }
}

function editPersona(persona) {
    openModal(persona);
}

async function deletePersona(numDocumento) {
    if (!confirm('¿Eliminar esta persona?')) return;
    
    try {
        const response = await fetch(`${API_URL}/api/personas/${numDocumento}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (!response.ok) throw new Error('Error');
        showNotification('Persona eliminada', 'success');
        loadPersonas();
    } catch (error) {
        showNotification('Error al eliminar', 'error');
    }
}

function filterPersonas() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const genero = document.getElementById('filterGenero').value;
    const tipoDoc = document.getElementById('filterTipoDoc').value;
    
    const filtered = allPersonas.filter(p => {
        const matchSearch = 
            p.nombrepersona.toLowerCase().includes(search) ||
            p.apellidopersona.toLowerCase().includes(search) ||
            p.numdocumento.toString().includes(search) ||
            p.correo.toLowerCase().includes(search);
        const matchGenero = !genero || p.genero === genero;
        const matchTipo = !tipoDoc || p.tipodocumento === tipoDoc;
        return matchSearch && matchGenero && matchTipo;
    });
    
    renderPersonas(filtered);
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} show`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}