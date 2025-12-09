// historias-clinicas.js
const API_URL = 'http://localhost:3000/api';
let currentHistoria = null;
let allHistorias = [];
let pacientes = [];
let enfermedades = [];
let citas = [];

document.addEventListener('DOMContentLoaded', () => {
    loadHistorias();
    loadPacientes();
    loadEnfermedades();
});

// Cargar historias clínicas
async function loadHistorias() {
    try {
        const response = await fetch(`${API_URL}/historias-clinicas`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (!response.ok) throw new Error('Error al cargar historias');
        
        allHistorias = await response.json();
        renderHistorias(allHistorias);
        updateStats();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al cargar historias clínicas', 'error');
    }
}

// Cargar pacientes
async function loadPacientes() {
    try {
        const response = await fetch(`${API_URL}/pacientes`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        pacientes = await response.json();
        populatePacienteSelect();
        populatePacienteFilter();
    } catch (error) {
        console.error('Error:', error);
    }
}

// Cargar enfermedades
async function loadEnfermedades() {
    try {
        const response = await fetch(`${API_URL}/enfermedades`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        enfermedades = await response.json();
    } catch (error) {
        console.error('Error:', error);
    }
}

// Poblar select de pacientes
function populatePacienteSelect() {
    const select = document.getElementById('codPaciente');
    select.innerHTML = '<option value="">Seleccione un paciente</option>';
    pacientes.forEach(p => {
        select.innerHTML += `
            <option value="${p.codpaciente}" data-documento="${p.numdocumento}">
                ${p.nombrepersona} ${p.apellidopersona} - ${p.numdocumento}
            </option>
        `;
    });
}

// Poblar filtro de pacientes
function populatePacienteFilter() {
    const select = document.getElementById('filterPaciente');
    pacientes.forEach(p => {
        select.innerHTML += `
            <option value="${p.codpaciente}">
                ${p.nombrepersona} ${p.apellidopersona}
            </option>
        `;
    });
}

// Renderizar tabla
function renderHistorias(historias) {
    const tbody = document.getElementById('historiasBody');
    tbody.innerHTML = '';
    
    if (historias.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="6" style="text-align:center; padding:40px;">
                No hay historias clínicas registradas
            </td></tr>
        `;
        return;
    }
    
    historias.forEach(historia => {
        const edad = calcularEdad(historia.fechanacimiento);
        const fecha = new Date(historia.fechacreacion || Date.now()).toLocaleDateString('es-ES');
        
        tbody.innerHTML += `
            <tr onclick="showDetails(${historia.codhistoria})">
                <td>${historia.codhistoria}</td>
                <td>${historia.paciente_nombre || 'N/A'}</td>
                <td>${historia.numdocumento}</td>
                <td>${edad} años</td>
                <td>${fecha}</td>
                <td onclick="event.stopPropagation();">
                    <button class="btn-icon" onclick="showDetails(${historia.codhistoria})" title="Ver">👁️</button>
                    <button class="btn-icon" onclick="deleteHistoria(${historia.codhistoria})" title="Eliminar">🗑️</button>
                </td>
            </tr>
        `;
    });
}

// Calcular edad
function calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return 'N/A';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    return edad;
}

// Actualizar estadísticas
function updateStats() {
    document.getElementById('totalHistorias').textContent = allHistorias.length;
    document.getElementById('historiasActivas').textContent = allHistorias.length;
}

// Abrir modal nueva historia
function openModal() {
    document.getElementById('historiaModal').style.display = 'block';
    document.getElementById('historiaForm').reset();
}

// Cerrar modal
function closeModal() {
    document.getElementById('historiaModal').style.display = 'none';
}

// Guardar historia
async function saveHistoria(event) {
    event.preventDefault();
    
    const select = document.getElementById('codPaciente');
    const data = {
        codPaciente: parseInt(select.value),
        numDocumento: parseInt(select.selectedOptions[0].dataset.documento)
    };
    
    try {
        const response = await fetch(`${API_URL}/historias-clinicas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Error al guardar');

        await registrarAuditoria('INSERT', 'historias-clinicas');
        
        showNotification('Historia clínica creada correctamente', 'success');
        closeModal();
        loadHistorias();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al crear historia clínica', 'error');
    }
}

// Mostrar detalles
async function showDetails(codHistoria) {
    try {
        const response = await fetch(`${API_URL}/historias-clinicas/${codHistoria}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const historia = await response.json();
        currentHistoria = historia;
        
        // Registrar acceso de lectura en auditoría
        await registrarAuditoria('SELECT', 'historias-clinicas');
        
        document.getElementById('historiaDetalles').innerHTML = `
            <div class="detail-row">
                <strong>Código Historia:</strong> <span>${historia.codhistoria}</span>
            </div>
            <div class="detail-row">
                <strong>Paciente:</strong> <span>${historia.paciente_nombre || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <strong>Documento:</strong> <span>${historia.numdocumento}</span>
            </div>
            <div class="detail-row">
                <strong>Edad:</strong> <span>${calcularEdad(historia.fechanacimiento)} años</span>
            </div>
            <div class="detail-row">
                <strong>Género:</strong> <span>${historia.genero === 'M' ? 'Masculino' : 'Femenino'}</span>
            </div>
        `;
        
        // Cargar diagnósticos
        await loadDiagnosticos(codHistoria);
        
        // Cargar citas del paciente
        await loadCitasPaciente(historia.codpaciente);
        
        document.getElementById('detallesModal').style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al cargar detalles', 'error');
    }
}

// Cargar diagnósticos
async function loadDiagnosticos(codHistoria) {
    try {
        const response = await fetch(`${API_URL}/historias-clinicas/${codHistoria}/diagnosticos`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const diagnosticos = await response.json();
        const container = document.getElementById('diagnosticosList');
        
        if (diagnosticos.length === 0) {
            container.innerHTML = '<p style="color:#999; text-align:center;">No hay diagnósticos registrados</p>';
            return;
        }
        
        container.innerHTML = '';
        diagnosticos.forEach(diag => {
            container.innerHTML += `
                <div class="diagnostico-item">
                    <strong>${diag.nombreenfermedad}</strong>
                    <p>Fecha: ${new Date(diag.fecharegistro).toLocaleDateString('es-ES')}</p>
                    <p>Cita ID: ${diag.idcita}</p>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

// Cargar citas del paciente
async function loadCitasPaciente(codPaciente) {
    try {
        const response = await fetch(`${API_URL}/citas?codPaciente=${codPaciente}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        citas = await response.json();
        populateCitasSelect();
    } catch (error) {
        console.error('Error:', error);
    }
}

// Poblar select de citas
function populateCitasSelect() {
    const select = document.getElementById('idCita');
    select.innerHTML = '<option value="">Seleccione una cita</option>';
    
    citas.filter(c => c.estado === 'Tomada').forEach(c => {
        select.innerHTML += `
            <option value="${c.idcita}">
                ${new Date(c.fecha).toLocaleDateString('es-ES')} - ${c.hora.substring(0,5)} - ${c.tiposervicio}
            </option>
        `;
    });
}

// Cerrar modal detalles
function closeDetallesModal() {
    document.getElementById('detallesModal').style.display = 'none';
    currentHistoria = null;
}

// Abrir modal diagnóstico
function openDiagnosticoModal() {
    const select = document.getElementById('idEnfermedad');
    select.innerHTML = '<option value="">Seleccione enfermedad</option>';
    enfermedades.forEach(e => {
        select.innerHTML += `
            <option value="${e.idenfermedad}">${e.nombreenfermedad}</option>
        `;
    });
    
    document.getElementById('diagnosticoModal').style.display = 'block';
}

// Cerrar modal diagnóstico
function closeDiagnosticoModal() {
    document.getElementById('diagnosticoModal').style.display = 'none';
    document.getElementById('diagnosticoForm').reset();
}

// Guardar diagnóstico
async function saveDiagnostico(event) {
    event.preventDefault();
    
    const data = {
        codHistoria: currentHistoria.codhistoria,
        idEnfermedad: parseInt(document.getElementById('idEnfermedad').value),
        idCita: parseInt(document.getElementById('idCita').value),
        fechaRegistro: new Date().toISOString().split('T')[0],
        horaRegistro: new Date().toTimeString().split(' ')[0]
    };
    
    try {
        const response = await fetch(`${API_URL}/historias-clinicas/diagnostico`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Error al guardar');

        await registrarAuditoria('INSERT', 'historias_clinicas_registra_diagnostica');
        
        showNotification('Diagnóstico registrado correctamente', 'success');
        closeDiagnosticoModal();
        await loadDiagnosticos(currentHistoria.codhistoria);
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al registrar diagnóstico', 'error');
    }
}

// Eliminar historia
async function deleteHistoria(codHistoria) {
    if (!confirm('¿Eliminar esta historia clínica?')) return;
    
    try {
        const response = await fetch(`${API_URL}/historias-clinicas/${codHistoria}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (!response.ok) throw new Error('Error');

        await registrarAuditoria('DELETE', 'historias-clinicas');
        
        showNotification('Historia eliminada', 'success');
        loadHistorias();
    } catch (error) {
        showNotification('Error al eliminar', 'error');
    }
}

// Filtrar historias
function filterHistorias() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const paciente = document.getElementById('filterPaciente').value;
    
    const filtered = allHistorias.filter(h => {
        const matchSearch = h.codhistoria.toString().includes(search) ||
                          (h.paciente_nombre || '').toLowerCase().includes(search) ||
                          h.numdocumento.toString().includes(search);
        const matchPaciente = !paciente || h.codpaciente == paciente;
        
        return matchSearch && matchPaciente;
    });
    
    renderHistorias(filtered);
}

// Notificaciones
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} show`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}