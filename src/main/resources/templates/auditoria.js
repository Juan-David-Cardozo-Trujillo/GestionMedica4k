const API_URL = 'http://localhost:8080/api';
let allAudits = [];

document.addEventListener('DOMContentLoaded', () => {
    loadAudit();
});


async function loadAudit() {
    try {
        const response = await fetch(`${API_URL}/auditoria`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error("Error de red");
        allAudits = await response.json();
        renderAudit(allAudits);
        updateStats(allAudits);
    } catch (error) {
        console.error(error);
        showNotification('Error al cargar auditoría', 'error');
    }
}

function renderAudit(audits) {
    const tbody = document.getElementById('auditBody');
    tbody.innerHTML = '';

    audits.forEach(audit => {
        // CORRECCIÓN: camelCase
        const fecha = new Date(audit.fechaEvento).toLocaleString('es-ES');
        // CORRECCIÓN: Acceso seguro a usuario anidado
        const usuarioNombre = audit.usuario ? audit.usuario.nombreUsuario : 'Sistema/Desconocido';
        const ip = audit.ipOrigen;
        const tabla = audit.tablaAfectada;
        const accion = audit.accion;

        tbody.innerHTML += `
            <tr>
                <td>${audit.idEvento}</td>
                <td>${fecha}</td>
                <td>${usuarioNombre}</td>
                <td><span class="badge badge-${accion.toLowerCase()}">${accion}</span></td>
                <td>${tabla}</td>
                <td>${ip}</td>
            </tr>
        `;
    });
}

function updateStats(audits) {
    document.getElementById('totalEvents').textContent = audits.length;

    const today = new Date().toDateString();
    const todayCount = audits.filter(a =>
        new Date(a.fechaEvento).toDateString() === today // camelCase
    ).length;
    document.getElementById('todayEvents').textContent = todayCount;
}

function filterAudit() {
    const tabla = document.getElementById('filterTabla').value.toLowerCase();

    const filtered = allAudits.filter(a => {
        // camelCase y validación de null
        const matchTabla = !tabla || (a.tablaAfectada && a.tablaAfectada.toLowerCase().includes(tabla));
        return matchTabla;
    });

    renderAudit(filtered);
}

// ... showNotification ...
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} show`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}