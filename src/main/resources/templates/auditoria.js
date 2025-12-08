const API_URL = 'http://localhost:3000/api';
let allAudits = [];

document.addEventListener('DOMContentLoaded', () => {
    loadAudit();
    setDefaultDates();
});

function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    document.getElementById('filterFechaInicio').value = weekAgo;
    document.getElementById('filterFechaFin').value = today;
}

async function loadAudit() {
    try {
        const response = await fetch(`${API_URL}/auditoria`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        allAudits = await response.json();
        renderAudit(allAudits);
        updateStats(allAudits);
    } catch (error) {
        showNotification('Error al cargar auditoría', 'error');
    }
}

function renderAudit(audits) {
    const tbody = document.getElementById('auditBody');
    tbody.innerHTML = '';
    
    audits.forEach(audit => {
        const fecha = new Date(audit.fechaevento).toLocaleString('es-ES');
        tbody.innerHTML += `
            <tr>
                <td>${audit.idevento}</td>
                <td>${fecha}</td>
                <td>${audit.nombreusuario || 'N/A'}</td>
                <td><span class="badge-${audit.accion.toLowerCase()}">${audit.accion}</span></td>
                <td>${audit.tablaafectada}</td>
                <td>${audit.iporigen}</td>
            </tr>
        `;
    });
}

function updateStats(audits) {
    document.getElementById('totalEvents').textContent = audits.length;
    
    const today = new Date().toDateString();
    const todayCount = audits.filter(a => 
        new Date(a.fechaevento).toDateString() === today
    ).length;
    document.getElementById('todayEvents').textContent = todayCount;
}

function filterAudit() {
    const fechaInicio = document.getElementById('filterFechaInicio').value;
    const fechaFin = document.getElementById('filterFechaFin').value;
    const accion = document.getElementById('filterAccion').value;
    const tabla = document.getElementById('filterTabla').value.toLowerCase();
    
    const filtered = allAudits.filter(a => {
        const fecha = new Date(a.fechaevento).toISOString().split('T')[0];
        const matchFecha = (!fechaInicio || fecha >= fechaInicio) && 
                          (!fechaFin || fecha <= fechaFin);
        const matchAccion = !accion || a.accion === accion;
        const matchTabla = !tabla || a.tablaafectada.toLowerCase().includes(tabla);
        return matchFecha && matchAccion && matchTabla;
    });
    
    renderAudit(filtered);
}

function exportToCSV() {
    const csv = ['ID,Fecha,Usuario,Acción,Tabla,IP'];
    allAudits.forEach(a => {
        csv.push(`${a.idevento},${a.fechaevento},${a.nombreusuario},${a.accion},${a.tablaafectada},${a.iporigen}`);
    });
    
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `auditoria_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} show`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}