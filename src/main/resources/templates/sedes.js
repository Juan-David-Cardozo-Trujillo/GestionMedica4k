// sedes.js
const API_URL = 'http://localhost:8080/api';
let allSedes = [];

document.addEventListener('DOMContentLoaded', () => {
    loadSedes();
});

// ========== CARGAR SEDES ==========
async function loadSedes() {
    try {
        const response = await fetch(`${API_URL}/sedes`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar sedes');
        
        allSedes = await response.json();
        renderSedesGrid(allSedes);
        updateStats();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al cargar las sedes hospitalarias', 'error');
    }
}

// ========== RENDERIZAR TARJETAS ==========
function renderSedesGrid(sedes) {
    const grid = document.getElementById('sedesGrid');
    grid.innerHTML = '';
    
    if (sedes.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <h3>No hay sedes hospitalarias registradas</h3>
                <p>El sistema no tiene sedes configuradas</p>
            </div>
        `;
        return;
    }
    
    sedes.forEach(sede => {
        const card = document.createElement('div');
        card.className = 'sede-card';
        card.innerHTML = `
            <div class="sede-card-icon">🏥</div>
            <h3>${sede.nombreSede}</h3>
            <p class="sede-id">ID: ${sede.idSede}</p>
            <div class="sede-card-actions">
                <button class="btn btn-primary" onclick="openEditModal(${sede.idSede}, '${sede.nombreSede.replace(/'/g, "\\'")}')">
                    ✏️ Editar
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ========== ACTUALIZAR ESTADÍSTICAS ==========
function updateStats() {
    document.getElementById('totalSedes').textContent = allSedes.length;
}

// ========== ABRIR MODAL EDITAR ==========
function openEditModal(idSede, nombreSede) {
    document.getElementById('idSede').value = idSede;
    document.getElementById('nombreSede').value = nombreSede;
    document.getElementById('sedeModal').style.display = 'block';
}

// ========== CERRAR MODAL ==========
function closeModal() {
    document.getElementById('sedeModal').style.display = 'none';
    document.getElementById('sedeForm').reset();
}

// ========== ACTUALIZAR SEDE ==========
async function updateSede(event) {
    event.preventDefault();
    
    const idSede = document.getElementById('idSede').value;
    const nombreSede = document.getElementById('nombreSede').value.trim();
    
    if (!nombreSede) {
        showNotification('El nombre de la sede es obligatorio', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/sedes/${idSede}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ 
                idSede: parseInt(idSede), 
                nombreSede: nombreSede 
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.mensaje || 'Error al actualizar');
        }
        
        showNotification('Sede actualizada correctamente', 'success');
        closeModal();
        loadSedes();
        
        // Registrar auditoría
        await registrarAuditoria('UPDATE', 'sedes_hospitalarias');
        
    } catch (error) {
        console.error('Error:', error);
        showNotification(error.message || 'Error al actualizar la sede', 'error');
    }
}

// ========== FILTRAR SEDES ==========
function filterSedes() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    
    const filtered = allSedes.filter(sede => 
        sede.nombreSede.toLowerCase().includes(search) ||
        sede.idSede.toString().includes(search)
    );
    
    renderSedesGrid(filtered);
}

// ========== REGISTRAR AUDITORÍA ==========
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

// ========== NOTIFICACIONES ==========
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ========== CERRAR MODAL AL HACER CLIC FUERA ==========
window.onclick = function(event) {
    const modal = document.getElementById('sedeModal');
    if (event.target === modal) {
        closeModal();
    }
}