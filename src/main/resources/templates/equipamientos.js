// equipamientos.js
const API_URL = 'http://localhost:3000/api';
let currentEquipamiento = null;
let allEquipamientos = [];
let sedes = [];
let departamentos = [];
let userRole = localStorage.getItem('userRole') || 'TecnicoMantenimiento';

document.addEventListener('DOMContentLoaded', () => {
    checkPermissions();
    loadEquipamientos();
    loadSedes();
    setFechaActual();
});

// Verificar permisos
function checkPermissions() {
    const readOnlyRoles = ['Medico', 'Secretaria'];
    const canEdit = ['TecnicoMantenimiento', 'AsistenteBodega', 'Administrador'];
    
    if (readOnlyRoles.includes(userRole)) {
        document.getElementById('btnNuevo').style.display = 'none';
        document.querySelector('.acciones-col').style.display = 'none';
    }
    
    if (!canEdit.includes(userRole)) {
        const mantenimientoSection = document.getElementById('mantenimientoSection');
        if (mantenimientoSection) mantenimientoSection.style.display = 'none';
    }
}

// Establecer fecha actual
function setFechaActual() {
    const today = new Date().toISOString().split('T')[0];
    const fechaInput = document.getElementById('fechaMantenimiento');
    if (fechaInput) fechaInput.max = today;
    
    const nuevaFecha = document.getElementById('nuevaFechaMantenimiento');
    if (nuevaFecha) nuevaFecha.value = today;
}

// Cargar equipamientos
async function loadEquipamientos() {
    try {
        const response = await fetch(`${API_URL}/equipamientos`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (!response.ok) throw new Error('Error al cargar');
        
        allEquipamientos = await response.json();
        renderEquipamientos(allEquipamientos);
        updateStats();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al cargar equipamientos', 'error');
    }
}

// Cargar sedes
async function loadSedes() {
    try {
        const response = await fetch(`${API_URL}/sedes`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        sedes = await response.json();
        populateSedesSelect();
    } catch (error) {
        console.error('Error:', error);
    }
}

// Poblar select de sedes
function populateSedesSelect() {
    const select = document.getElementById('idSedeAsignar');
    if (!select) return;
    
    select.innerHTML = '<option value="">Seleccione sede</option>';
    sedes.forEach(s => {
        select.innerHTML += `<option value="${s.idsede}">${s.nombresede}</option>`;
    });
}

// Cargar departamentos por sede
async function loadDepartamentosSede() {
    const idSede = document.getElementById('idSedeAsignar').value;
    if (!idSede) return;
    
    try {
        const response = await fetch(`${API_URL}/departamentos?idSede=${idSede}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        departamentos = await response.json();
        
        const select = document.getElementById('nombreDepartamentoAsignar');
        select.innerHTML = '<option value="">Seleccione departamento</option>';
        departamentos.forEach(d => {
            select.innerHTML += `
                <option value="${d.nombredepartamento}">
                    ${d.nombredepartamento}
                </option>
            `;
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

// Renderizar tabla
function renderEquipamientos(equipamientos) {
    const tbody = document.getElementById('equipamientosBody');
    tbody.innerHTML = '';
    
    if (equipamientos.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="7" style="text-align:center; padding:40px;">
                No hay equipamientos registrados
            </td></tr>
        `;
        return;
    }
    
    equipamientos.forEach(equip => {
        const fechaMant = new Date(equip.fechamantenimiento);
        const proximaMant = new Date(fechaMant);
        proximaMant.setMonth(proximaMant.getMonth() + 6);
        
        const hoy = new Date();
        const diasRestantes = Math.ceil((proximaMant - hoy) / (1000 * 60 * 60 * 24));
        
        let diasClass = '';
        let diasText = diasRestantes;
        if (diasRestantes < 0) {
            diasClass = 'text-danger';
            diasText = `Vencido (${Math.abs(diasRestantes)} días)`;
        } else if (diasRestantes < 30) {
            diasClass = 'text-warning';
            diasText = `${diasRestantes} días`;
        } else {
            diasClass = 'text-success';
            diasText = `${diasRestantes} días`;
        }
        
        const estadoClass = equip.estado === 'Operativo' ? 'operativo' :
                           equip.estado === 'En Mantenimiento' ? 'mantenimiento' : 
                           'fuera-servicio';
        
        const canEdit = ['TecnicoMantenimiento', 'AsistenteBodega', 'Administrador'];
        const accionesHTML = canEdit.includes(userRole) ? `
            <button class="btn-icon" onclick="showDetails(${equip.codequip})" title="Ver">👁️</button>
            <button class="btn-icon" onclick='editEquipamiento(${JSON.stringify(equip)})' title="Editar">✏️</button>
            <button class="btn-icon" onclick="deleteEquipamiento(${equip.codequip})" title="Eliminar">🗑️</button>
        ` : `
            <button class="btn-icon" onclick="showDetails(${equip.codequip})" title="Ver">👁️</button>
        `;
        
        tbody.innerHTML += `
            <tr>
                <td>${equip.codequip}</td>
                <td>${equip.nombreequip}</td>
                <td>${fechaMant.toLocaleDateString('es-ES')}</td>
                <td>${proximaMant.toLocaleDateString('es-ES')}</td>
                <td><span class="status-badge ${estadoClass}">${equip.estado}</span></td>
                <td class="${diasClass}">${diasText}</td>
                <td class="acciones-col">${accionesHTML}</td>
            </tr>
        `;
    });
}

// Actualizar estadísticas
function updateStats() {
    document.getElementById('totalEquipos').textContent = allEquipamientos.length;
    document.getElementById('operativos').textContent = 
        allEquipamientos.filter(e => e.estado === 'Operativo').length;
    document.getElementById('enMantenimiento').textContent = 
        allEquipamientos.filter(e => e.estado === 'En Mantenimiento').length;
}

// Abrir modal
function openModal(equipamiento = null) {
    const modal = document.getElementById('equipamientoModal');
    const form = document.getElementById('equipamientoForm');
    const title = document.getElementById('modalTitle');
    
    if (equipamiento) {
        title.textContent = 'Editar Equipamiento';
        currentEquipamiento = equipamiento;
        document.getElementById('nombreEquip').value = equipamiento.nombreequip;
        document.getElementById('fechaMantenimiento').value = equipamiento.fechamantenimiento;
        document.getElementById('estado').value = equipamiento.estado;
    } else {
        title.textContent = 'Nuevo Equipamiento';
        currentEquipamiento = null;
        form.reset();
        setFechaActual();
    }
    
    modal.style.display = 'block';
}

// Cerrar modal
function closeModal() {
    document.getElementById('equipamientoModal').style.display = 'none';
}

// Guardar equipamiento
async function saveEquipamiento(event) {
    event.preventDefault();
    
    const data = {
        nombreEquip: document.getElementById('nombreEquip').value.trim(),
        fechaMantenimiento: document.getElementById('fechaMantenimiento').value,
        estado: document.getElementById('estado').value
    };
    
    try {
        const url = currentEquipamiento 
            ? `${API_URL}/equipamientos/${currentEquipamiento.codequip}`
            : `${API_URL}/equipamientos`;
        const method = currentEquipamiento ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Error al guardar');
        
        showNotification('Equipamiento guardado correctamente', 'success');
        closeModal();
        loadEquipamientos();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al guardar equipamiento', 'error');
    }
}

// Editar equipamiento
function editEquipamiento(equipamiento) {
    openModal(equipamiento);
}

// Mostrar detalles
async function showDetails(codEquip) {
    try {
        const response = await fetch(`${API_URL}/equipamientos/${codEquip}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const equip = await response.json();
        currentEquipamiento = equip;
        
        const fechaMant = new Date(equip.fechamantenimiento);
        const proximaMant = new Date(fechaMant);
        proximaMant.setMonth(proximaMant.getMonth() + 6);
        
        const estadoClass = equip.estado === 'Operativo' ? 'operativo' :
                           equip.estado === 'En Mantenimiento' ? 'mantenimiento' : 
                           'fuera-servicio';
        
        document.getElementById('equipamientoDetalles').innerHTML = `
            <div class="detail-row">
                <strong>Código:</strong> <span>${equip.codequip}</span>
            </div>
            <div class="detail-row">
                <strong>Nombre:</strong> <span>${equip.nombreequip}</span>
            </div>
            <div class="detail-row">
                <strong>Último Mantenimiento:</strong> 
                <span>${fechaMant.toLocaleDateString('es-ES')}</span>
            </div>
            <div class="detail-row">
                <strong>Próximo Mantenimiento:</strong> 
                <span>${proximaMant.toLocaleDateString('es-ES')}</span>
            </div>
            <div class="detail-row">
                <strong>Estado:</strong> 
                <span class="status-badge ${estadoClass}">${equip.estado}</span>
            </div>
        `;
        
        // Cargar departamentos asignados
        await loadDepartamentosAsignados(codEquip);
        
        document.getElementById('detallesModal').style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al cargar detalles', 'error');
    }
}

// Cargar departamentos asignados
async function loadDepartamentosAsignados(codEquip) {
    try {
        const response = await fetch(`${API_URL}/equipamientos/${codEquip}/departamentos`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const depts = await response.json();
        const container = document.getElementById('departamentosList');
        
        if (depts.length === 0) {
            container.innerHTML = '<p style="color:#999; text-align:center;">No asignado a departamentos</p>';
            return;
        }
        
        container.innerHTML = '';
        depts.forEach(dept => {
            container.innerHTML += `
                <div class="diagnostico-item">
                    <strong>${dept.nombredepartamento}</strong>
                    <p>Sede: ${dept.nombresede || 'N/A'}</p>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

// Cerrar modal detalles
function closeDetallesModal() {
    document.getElementById('detallesModal').style.display = 'none';
}

// Registrar mantenimiento
async function registrarMantenimiento(event) {
    event.preventDefault();
    
    const data = {
        ...currentEquipamiento,
        fechaMantenimiento: document.getElementById('nuevaFechaMantenimiento').value,
        estado: document.getElementById('nuevoEstado').value
    };
    
    try {
        const response = await fetch(`${API_URL}/equipamientos/${currentEquipamiento.codequip}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Error al actualizar');
        
        showNotification('Mantenimiento registrado correctamente', 'success');
        closeDetallesModal();
        loadEquipamientos();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al registrar mantenimiento', 'error');
    }
}

// Abrir modal asignar
function openAsignarModal() {
    document.getElementById('asignarModal').style.display = 'block';
}

// Cerrar modal asignar
function closeAsignarModal() {
    document.getElementById('asignarModal').style.display = 'none';
    document.getElementById('asignarForm').reset();
}

// Asignar a departamento
async function asignarDepartamento(event) {
    event.preventDefault();
    
    const data = {
        codEquip: currentEquipamiento.codequip,
        nombreDepartamento: document.getElementById('nombreDepartamentoAsignar').value,
        idSede: parseInt(document.getElementById('idSedeAsignar').value)
    };
    
    try {
        const response = await fetch(`${API_URL}/equipamientos/asignar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Error al asignar');
        
        showNotification('Equipamiento asignado correctamente', 'success');
        closeAsignarModal();
        await loadDepartamentosAsignados(currentEquipamiento.codequip);
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al asignar equipamiento', 'error');
    }
}

// Eliminar equipamiento
async function deleteEquipamiento(codEquip) {
    if (!confirm('¿Eliminar este equipamiento?')) return;
    
    try {
        const response = await fetch(`${API_URL}/equipamientos/${codEquip}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (!response.ok) throw new Error('Error');
        
        showNotification('Equipamiento eliminado', 'success');
        loadEquipamientos();
    } catch (error) {
        showNotification('Error al eliminar', 'error');
    }
}

// Filtrar equipamientos
function filterEquipamientos() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const estadoFilter = document.getElementById('filterEstado').value;
    const fechaFilter = document.getElementById('filterFecha').value;
    
    const filtered = allEquipamientos.filter(equip => {
        const matchSearch = equip.nombreequip.toLowerCase().includes(search) ||
                          equip.codequip.toString().includes(search);
        const matchEstado = !estadoFilter || equip.estado === estadoFilter;
        
        let matchFecha = true;
        if (fechaFilter) {
            const fechaMant = new Date(equip.fechamantenimiento);
            const filterDate = new Date(fechaFilter);
            matchFecha = fechaMant.getMonth() === filterDate.getMonth() &&
                        fechaMant.getFullYear() === filterDate.getFullYear();
        }
        
        return matchSearch && matchEstado && matchFecha;
    });
    
    renderEquipamientos(filtered);
}

// Notificaciones
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} show`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Estilos adicionales para texto
const style = document.createElement('style');
style.textContent = `
    .text-danger { color: #dc3545; font-weight: 600; }
    .text-warning { color: #ffc107; font-weight: 600; }
    .text-success { color: #28a745; font-weight: 600; }
`;
document.head.appendChild(style);