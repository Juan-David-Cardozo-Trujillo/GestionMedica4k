// reportes.js
const API_URL = 'http://localhost:3000/api';
let currentReporte = null;

// Configuración de reportes
const reportesConfig = {
    medicamentos: {
        title: '💊 Medicamentos Más Recetados por Sede',
        endpoint: '/reportes/medicamentos-recetados',
        columns: ['Sede', 'Medicamento', 'Total Recetas']
    },
    medicos: {
        title: '👨‍⚕️ Médicos con Más Consultas por Semana',
        endpoint: '/reportes/medicos-consultas',
        columns: ['Nombre', 'Apellido', 'Semana', 'Total Consultas']
    },
    tiempo: {
        title: '⏱️ Tiempo Promedio entre Cita y Diagnóstico',
        endpoint: '/reportes/tiempo-promedio',
        columns: ['Promedio (días)']
    },
    auditoria: {
        title: '🔍 Últimas Auditorías de Historias Clínicas',
        endpoint: '/reportes/auditoria',
        columns: ['Evento ID', 'Fecha', 'Usuario', 'Acción', 'Tabla', 'IP']
    },
    equipamiento: {
        title: '⚙️ Departamentos que Comparten Equipamiento',
        endpoint: '/reportes/departamentos-equipamiento',
        columns: ['Sede', 'Departamento', 'Código Equipo']
    },
    enfermedades: {
        title: '🦠 Pacientes por Enfermedad y Sede',
        endpoint: '/reportes/pacientes-enfermedad',
        columns: ['Sede', 'Enfermedad', 'Total Pacientes']
    }
};

document.addEventListener('DOMContentLoaded', () => {
    cargarSedes();
});

// Cargar sedes para filtros
async function cargarSedes() {
    try {
        const response = await fetch(`${API_URL}/sedes`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const sedes = await response.json();
        
        const select = document.getElementById('sedeFilter');
        sedes.forEach(sede => {
            select.innerHTML += `<option value="${sede.idsede}">${sede.nombresede}</option>`;
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

// Cargar reporte
async function loadReporte(tipo) {
    const config = reportesConfig[tipo];
    if (!config) return;
    
    currentReporte = tipo;
    
    // Mostrar área de resultados
    document.getElementById('resultadosArea').style.display = 'block';
    document.getElementById('reporteTitle').textContent = config.title;
    document.getElementById('loading').style.display = 'block';
    document.getElementById('reporteContent').innerHTML = '';
    
    // Scroll al área de resultados
    document.getElementById('resultadosArea').scrollIntoView({ behavior: 'smooth' });
    
    try {
        const response = await fetch(`${API_URL}${config.endpoint}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (!response.ok) throw new Error('Error al cargar reporte');
        
        const datos = await response.json();
        
        // Ocultar loading
        document.getElementById('loading').style.display = 'none';
        
        // Renderizar según tipo de reporte
        switch(tipo) {
            case 'tiempo':
                renderTiempoPromedio(datos);
                break;
            case 'medicamentos':
            case 'medicos':
            case 'enfermedades':
                renderReporteConGrafica(datos, config);
                break;
            default:
                renderReporteTabla(datos, config);
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loading').style.display = 'none';
        mostrarError('Error al cargar el reporte');
    }
}

// Renderizar tiempo promedio
function renderTiempoPromedio(datos) {
    const promedio = datos.promedio_duracion || 0;
    const dias = Math.floor(promedio);
    const horas = Math.round((promedio - dias) * 24);
    
    document.getElementById('reporteContent').innerHTML = `
        <div class="resultado-destacado">
            <p>Tiempo Promedio entre Cita y Diagnóstico</p>
            <div class="valor">${dias} días ${horas}h</div>
            <p>Basado en todas las citas realizadas</p>
        </div>
        
        <div class="reporte-stats">
            <div class="stat-box">
                <div class="number">${dias}</div>
                <div class="label">Días</div>
            </div>
            <div class="stat-box">
                <div class="number">${horas}</div>
                <div class="label">Horas</div>
            </div>
            <div class="stat-box">
                <div class="number">${promedio.toFixed(2)}</div>
                <div class="label">Total (días)</div>
            </div>
        </div>
    `;
}

// Renderizar reporte con gráfica
function renderReporteConGrafica(datos, config) {
    if (!datos || datos.length === 0) {
        mostrarEmpty();
        return;
    }
    
    const maxValue = Math.max(...datos.map(d => parseInt(Object.values(d)[Object.values(d).length - 1])));
    
    let chartHTML = '<div class="chart-container"><h3>Visualización de Datos</h3><div class="simple-chart">';
    
    datos.slice(0, 10).forEach(item => {
        const values = Object.values(item);
        const label = values[0] || 'N/A';
        const value = parseInt(values[values.length - 1]) || 0;
        const height = (value / maxValue) * 250;
        
        chartHTML += `
            <div class="chart-bar" style="height: ${height}px;">
                <div class="chart-bar-value">${value}</div>
                <div class="chart-bar-label">${label}</div>
            </div>
        `;
    });
    
    chartHTML += '</div></div>';
    
    document.getElementById('reporteContent').innerHTML = chartHTML + 
        renderTabla(datos, config);
}

// Renderizar reporte tabla
function renderReporteTabla(datos, config) {
    if (!datos || datos.length === 0) {
        mostrarEmpty();
        return;
    }
    
    document.getElementById('reporteContent').innerHTML = renderTabla(datos, config);
}

// Renderizar tabla
function renderTabla(datos, config) {
    let tableHTML = `
        <div class="reporte-stats">
            <div class="stat-box">
                <div class="number">${datos.length}</div>
                <div class="label">Total Registros</div>
            </div>
        </div>
        <table class="reporte-table">
            <thead>
                <tr>
                    ${config.columns.map(col => `<th>${col}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
    `;
    
    datos.forEach(row => {
        tableHTML += '<tr>';
        Object.values(row).forEach(value => {
            tableHTML += `<td>${value || 'N/A'}</td>`;
        });
        tableHTML += '</tr>';
    });
    
    tableHTML += '</tbody></table>';
    
    return tableHTML;
}

// Mostrar estado vacío
function mostrarEmpty() {
    document.getElementById('reporteContent').innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">📊</div>
            <h3>No hay datos disponibles</h3>
            <p>No se encontraron registros para este reporte</p>
        </div>
    `;
}

// Mostrar error
function mostrarError(mensaje) {
    document.getElementById('reporteContent').innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">⚠️</div>
            <h3>Error al cargar reporte</h3>
            <p>${mensaje}</p>
        </div>
    `;
}

// Cerrar reporte
function cerrarReporte() {
    document.getElementById('resultadosArea').style.display = 'none';
    currentReporte = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Exportar todos los reportes
async function exportarTodos() {
    if (!confirm('¿Desea exportar todos los reportes a CSV?')) return;
    
    for (const [tipo, config] of Object.entries(reportesConfig)) {
        try {
            const response = await fetch(`${API_URL}${config.endpoint}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            
            const datos = await response.json();
            exportarCSV(datos, config.title, config.columns);
            
            // Esperar un poco entre exportaciones
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error(`Error exportando ${tipo}:`, error);
        }
    }
    
    alert('Exportación completada');
}

// Exportar a CSV
function exportarCSV(datos, titulo, columnas) {
    if (!datos || datos.length === 0) return;
    
    let csv = '\ufeff'; // BOM para UTF-8
    csv += columnas.join(',') + '\n';
    
    datos.forEach(row => {
        const values = Object.values(row).map(v => `"${v}"`);
        csv += values.join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const filename = `${titulo.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Abrir modal de filtros
function abrirFiltros() {
    document.getElementById('filtrosModal').style.display = 'block';
}

// Cerrar modal de filtros
function cerrarFiltros() {
    document.getElementById('filtrosModal').style.display = 'none';
}

// Aplicar filtros
function aplicarFiltros() {
    const fechaDesde = document.getElementById('fechaDesde').value;
    const fechaHasta = document.getElementById('fechaHasta').value;
    const sede = document.getElementById('sedeFilter').value;
    
    // Recargar reporte con filtros
    if (currentReporte) {
        // Aquí se implementaría la lógica de filtrado
        // Por ahora solo recargamos el reporte
        loadReporte(currentReporte);
    }
    
    cerrarFiltros();
}

// Notificación
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 18px 25px;
        border-radius: 12px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        background: ${type === 'success' ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' : 
                                           'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'};
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Estilos adicionales para animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);