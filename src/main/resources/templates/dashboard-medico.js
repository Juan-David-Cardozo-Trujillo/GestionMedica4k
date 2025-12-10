// dashboard-medico.js
const API_URL = 'http://localhost:8080';

let currentDate = new Date();
let todasLasCitas = [];
let empleadoInfo = null;

document.addEventListener('DOMContentLoaded', () => {
    loadMedicoInfo();
    loadCitasMedico();
});

// Cargar información del médico
async function loadMedicoInfo() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    
    if (!usuario) {
        window.location.href = '/login';
        return;
    }

    // Verificar que el usuario sea médico
    if (usuario.rol.toLowerCase() !== 'medico' && usuario.rol.toLowerCase() !== 'médico') {
        alert('Acceso denegado. Esta página es solo para médicos.');
        window.location.href = '/dashboard';
        return;
    }

    try {
        // Buscar el empleado correspondiente al usuario
        const empleadosResponse = await fetch(`${API_URL}/api/empleados`);
        const empleados = await empleadosResponse.json();
        
        empleadoInfo = empleados.find(emp => emp.persona && emp.persona.numdocumento === usuario.numDocumento);
        
        if (empleadoInfo) {
            const nombre = `Dr. ${empleadoInfo.persona.nombrePersona} ${empleadoInfo.persona.apellidoPersona}`;
            document.getElementById('medicoName').textContent = nombre;
        } else {
            document.getElementById('medicoName').textContent = usuario.nombreUsuario;
        }
    } catch (error) {
        console.error('Error al cargar info del médico:', error);
    }
}

// Cargar citas del médico
async function loadCitasMedico() {
    try {
        const response = await fetch(`${API_URL}/api/citas`);
        const todasCitas = await response.json();
        
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        
        // Filtrar solo las citas del médico actual (excluyendo canceladas)
        todasLasCitas = todasCitas.filter(cita => {
            return cita.medico && 
                cita.medico.numdocumento === usuario.numDocumento &&
                cita.estado !== 'Cancelada';
        });
        
        renderCalendar();
    } catch (error) {
        console.error('Error al cargar citas:', error);
    }
}

// Renderizar calendario
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Actualizar título del mes
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;
    
    // Obtener primer día y cantidad de días del mes
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Crear grid del calendario
    let calendarHTML = `
        <div class="calendar-header">Domingo</div>
        <div class="calendar-header">Lunes</div>
        <div class="calendar-header">Martes</div>
        <div class="calendar-header">Miércoles</div>
        <div class="calendar-header">Jueves</div>
        <div class="calendar-header">Viernes</div>
        <div class="calendar-header">Sábado</div>
    `;
    
    // Agregar días vacíos antes del primer día
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarHTML += '<div class="calendar-day empty"></div>';
    }
    
    // Agregar días del mes
    for (let day = 1; day <= daysInMonth; day++) {
        const currentDayDate = new Date(year, month, day);
        const dateString = currentDayDate.toISOString().split('T')[0];
        
        // Contar citas de este día
        const citasDelDia = todasLasCitas.filter(cita => cita.fecha === dateString);
        const numCitas = citasDelDia.length;
        
        // Verificar si es hoy
        const today = new Date();
        const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
        
        // Crear preview de las citas del día
        let citasPreview = '';
        if (numCitas > 0) {
            citasPreview = citasDelDia.slice(0, 2).map(cita => {
                const hora = cita.hora || 'Sin hora';
                const paciente = cita.paciente?.nombrePersona 
                    ? `${cita.paciente.nombrePersona} ${cita.paciente.apellidoPersona}`
                    : 'Paciente';
                return `<div class="cita-preview">🕐 ${hora} - ${paciente}</div>`;
            }).join('');
            if (numCitas > 2) {
                citasPreview += `<div class="cita-preview">+${numCitas - 2} más...</div>`;
            }
        }
        
        calendarHTML += `
            <div class="calendar-day ${isToday ? 'today' : ''} ${numCitas > 0 ? 'has-appointments' : ''}" 
                 onclick="showCitasDelDia('${dateString}')">
                <span class="day-number">${day}</span>
                ${numCitas > 0 ? `<span class="appointment-count">${numCitas} cita${numCitas > 1 ? 's' : ''}</span>` : ''}
                ${citasPreview}
            </div>
        `;
    }
    
    document.getElementById('calendar').innerHTML = calendarHTML;
}

// Mostrar citas de un día específico
function showCitasDelDia(dateString) {
    const citasDelDia = todasLasCitas.filter(cita => cita.fecha === dateString);
    
    const container = document.getElementById('listaCitasDia');
    
    if (citasDelDia.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">No hay citas programadas para este día</p>';
        return;
    }
    
    // Ordenar por hora
    citasDelDia.sort((a, b) => (a.hora || '').localeCompare(b.hora || ''));
    
    container.innerHTML = citasDelDia.map(cita => {
        const pacienteNombre = cita.paciente?.nombrePersona && cita.paciente?.apellidoPersona
            ? `${cita.paciente.nombrePersona} ${cita.paciente.apellidoPersona}`
            : 'Paciente no especificado';
        
        const pacienteDoc = cita.paciente?.numdocumento || 'N/A';
        const pacienteTel = cita.paciente?.persona?.telefono || 'N/A';
        const estadoClass = cita.estado.toLowerCase();
        
        return `
            <div class="cita-card">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                    <div>
                        <strong style="font-size: 1.1rem;">🕐 ${cita.hora || 'Sin hora'}</strong>
                        <span class="badge ${estadoClass}" style="margin-left: 1rem;">${cita.estado}</span>
                    </div>
                </div>
                <p><strong>👤 Paciente:</strong> ${pacienteNombre}</p>
                <p><strong>📄 Documento:</strong> ${pacienteDoc}</p>
                <p><strong>📋 Tipo de Servicio:</strong> ${cita.tiposervicio || 'Consulta General'}</p>
                <p><strong>🏥 ID Cita:</strong> ${cita.idcita}</p>
                ${cita.observaciones ? `<p><strong>📝 Observaciones:</strong> ${cita.observaciones}</p>` : ''}
            </div>
        `;
    }).join('');
}

// Navegar a mes anterior
function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

// Navegar a mes siguiente
function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}
