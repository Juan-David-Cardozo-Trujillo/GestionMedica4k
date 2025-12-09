// historias-clinicas.js
const API_URL = 'http://localhost:8080/api';
let currentHistoria = null;
let allHistorias = [];
let pacientes = [];
let enfermedades = [];

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
        const nombre = p.persona ? `${p.persona.nombrePersona} ${p.persona.apellidoPersona}` : 'Sin nombre';
        const numDoc = p.persona ? p.persona.numDocumento : 'N/A';
        select.innerHTML += `
            <option value="${p.codPaciente}">
                ${nombre} - ${numDoc}
            </option>
        `;
    });
}

// Poblar filtro de pacientes
function populatePacienteFilter() {
    const select = document.getElementById('filterPaciente');
    select.innerHTML = '<option value="">Todos los pacientes</option>';
    pacientes.forEach(p => {
        const nombre = p.persona ? `${p.persona.nombrePersona} ${p.persona.apellidoPersona}` : 'Sin nombre';
        select.innerHTML += `
            <option value="${p.codPaciente}">
                ${nombre}
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
            <tr>
                <td colspan="6" style="text-align:center; padding:60px; color:#999; font-size:16px;">
                    <div style="display:flex; flex-direction:column; align-items:center; gap:10px;">
                        <span style="font-size:48px;">📋</span>
                        <strong>No hay historias clínicas registradas</strong>
                        <span style="font-size:14px; color:#aaa;">Haz clic en "Nueva Historia Clínica" para crear una</span>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    historias.forEach(historia => {
        const paciente = historia.paciente || {};
        const nombre = paciente.nombrePersona ? `${paciente.nombrePersona} ${paciente.apellidoPersona}` : 'N/A';
        const edad = calcularEdad(paciente.fechaNacimiento);
        const fecha = new Date(historia.fechaCreacion || Date.now()).toLocaleDateString('es-ES');
        
        tbody.innerHTML += `
            <tr onclick="showDetails(${historia.codigoHistoria})">
                <td>${historia.codigoHistoria}</td>
                <td>${nombre}</td>
                <td>${paciente.numDocumento || 'N/A'}</td>
                <td>${edad || 'N/A'}</td>
                <td>${fecha}</td>
                <td onclick="event.stopPropagation();">
                    <button class="btn-icon" onclick="showDetails(${historia.codigoHistoria})" title="Ver">👁️</button>
                    <button class="btn-icon" onclick="deleteHistoria(${historia.codigoHistoria})" title="Eliminar">🗑️</button>
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
    
    const codPaciente = parseInt(document.getElementById('codPaciente').value);
    const observaciones = document.getElementById('observaciones').value;
    
    if (!codPaciente) {
        showNotification('Por favor seleccione un paciente', 'error');
        return;
    }
    
    const data = {
        codPaciente: codPaciente,
        observaciones: observaciones
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
async function showDetails(codigoHistoria) {
    try {
        const response = await fetch(`${API_URL}/historias-clinicas/${codigoHistoria}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (!response.ok) throw new Error('Error al cargar');
        
        const historia = await response.json();
        currentHistoria = historia;
        
        // Registrar acceso de lectura en auditoría
        await registrarAuditoria('SELECT', 'historias-clinicas');
        
        const paciente = historia.paciente || {};
        const nombre = paciente.nombrePersona ? `${paciente.nombrePersona} ${paciente.apellidoPersona}` : 'N/A';
        const edad = calcularEdad(paciente.fechaNacimiento);
        
        document.getElementById('historiaDetalles').innerHTML = `
            <div class="detail-row">
                <strong>Código Historia:</strong> <span>${historia.codigoHistoria}</span>
            </div>
            <div class="detail-row">
                <strong>Paciente:</strong> <span>${nombre}</span>
            </div>
            <div class="detail-row">
                <strong>Documento:</strong> <span>${paciente.numDocumento || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <strong>Edad:</strong> <span>${edad || 'N/A'} años</span>
            </div>
            <div class="detail-row">
                <strong>Fecha de Creación:</strong> <span>${new Date(historia.fechaCreacion).toLocaleDateString('es-ES')}</span>
            </div>
            <div class="detail-row">
                <strong>Observaciones:</strong> <span>${historia.observaciones || 'Sin observaciones'}</span>
            </div>
        `;
        
        // Cargar diagnósticos
        renderDiagnosticos(historia.diagnosticos || []);
        
        document.getElementById('detallesModal').style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al cargar detalles', 'error');
    }
}

// Renderizar diagnósticos
function renderDiagnosticos(diagnosticos) {
    const container = document.getElementById('diagnosticosList');
    
    if (!diagnosticos || diagnosticos.length === 0) {
        container.innerHTML = '<p style="color:#999; text-align:center;">No hay diagnósticos registrados</p>';
        return;
    }
    
    container.innerHTML = '';
    diagnosticos.forEach(diag => {
        const nombreEnfermedad = diag.nombreEnfermedad || 'Enfermedad desconocida';
        const fecha = new Date(diag.fechaRegistro).toLocaleDateString('es-ES');
        
        container.innerHTML += `
            <div class="diagnostico-item">
                <strong>${nombreEnfermedad}</strong>
                <p>Descripción: ${diag.descripcion || 'N/A'}</p>
                <p>Fecha: ${fecha}</p>
            </div>
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
        const pacienteData = h.paciente || {};
        const nombre = pacienteData.nombrePersona ? `${pacienteData.nombrePersona} ${pacienteData.apellidoPersona}` : '';
        
        const matchSearch = h.codigoHistoria.toString().includes(search) ||
                          nombre.toLowerCase().includes(search) ||
                          (pacienteData.numDocumento ? pacienteData.numDocumento.toString().includes(search) : false);
        
        const matchPaciente = !paciente || (pacienteData.codPaciente && pacienteData.codPaciente.toString() === paciente);
        
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

// Registrar auditoría
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