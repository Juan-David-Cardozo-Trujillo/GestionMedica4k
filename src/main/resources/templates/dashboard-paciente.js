// dashboard-paciente.js
const API_URL = 'http://localhost:8080';

// Cargar información del usuario al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    loadPacienteData();
});

// Cargar información del usuario desde localStorage
function loadUserInfo() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    
    if (!usuario) {
        window.location.href = '/login';
        return;
    }

    // Verificar que el usuario sea paciente
    if (usuario.rol.toLowerCase() !== 'paciente') {
        alert('Acceso denegado. Esta página es solo para pacientes.');
        window.location.href = '/dashboard';
        return;
    }

    // Mostrar nombre del usuario
    const userName = usuario.nombreUsuario || 'Usuario';
    document.getElementById('userName').textContent = userName;
}

// Cargar todos los datos del paciente
async function loadPacienteData() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    
    if (!usuario || !usuario.numDocumento) {
        showError('No se pudo obtener la información del usuario');
        return;
    }

    try {
        // Primero obtener información del paciente para conseguir el codPaciente
        const response = await fetch(`${API_URL}/api/paciente/info/${usuario.numDocumento}`);
        const data = await response.json();

        if (data.success && data.paciente) {
            const codPaciente = data.paciente.codPaciente;
            
            // Guardar codPaciente en localStorage para futuros usos
            localStorage.setItem('codPaciente', codPaciente);

            // Cargar datos en paralelo
            await Promise.all([
                loadCitasProximas(codPaciente),
                loadHistorialCitas(codPaciente),
                loadHistoriaClinica(codPaciente)
            ]);
        } else {
            showError('No se encontró información del paciente');
        }
    } catch (error) {
        console.error('Error al cargar datos del paciente:', error);
        showError('Error al cargar la información');
    }
}

// Cargar citas próximas
async function loadCitasProximas(codPaciente) {
    try {
        const response = await fetch(`${API_URL}/api/citas`);
        const todasLasCitas = await response.json();
        
        console.log('Todas las citas recibidas:', todasLasCitas); // Debug
        
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        
        // Filtrar citas del paciente que sean futuras o pendientes
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        const citasPaciente = todasLasCitas.filter(cita => {
            return cita.paciente && 
                cita.paciente.numdocumento === usuario.numDocumento &&
                (cita.estado === 'Pendiente' || cita.estado === 'Tomada') &&
                new Date(cita.fecha) >= hoy;
        });
        
        console.log('Citas del paciente filtradas:', citasPaciente); // Debug
        
        // Ordenar por fecha
        citasPaciente.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        const container = document.getElementById('citasProximas');

        if (citasPaciente.length > 0) {
            container.innerHTML = citasPaciente.map(cita => createCitaHTML(cita)).join('');
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📅</div>
                    <p>No tienes citas programadas</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error al cargar citas próximas:', error);
        document.getElementById('citasProximas').innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <p>Error al cargar las citas</p>
            </div>
        `;
    }
}

// Cargar historial de citas
async function loadHistorialCitas(codPaciente) {
    try {
        const response = await fetch(`${API_URL}/api/citas`);
        const todasLasCitas = await response.json();
        
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        
        // Filtrar citas del paciente que ya pasaron o fueron canceladas
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        const historialPaciente = todasLasCitas.filter(cita => 
            cita.paciente && 
            cita.paciente.numDocumento === usuario.numDocumento &&
            (cita.estado === 'Cancelada' || new Date(cita.fecha) < hoy)
        );
        
        // Ordenar por fecha descendente (más reciente primero)
        historialPaciente.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        const container = document.getElementById('citasHistorial');

        if (historialPaciente.length > 0) {
            // Mostrar solo las últimas 5 citas
            const citasRecientes = historialPaciente.slice(0, 5);
            container.innerHTML = citasRecientes.map(cita => createCitaHTML(cita)).join('');
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <p>No hay historial de citas</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error al cargar historial de citas:', error);
        document.getElementById('citasHistorial').innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <p>Error al cargar el historial</p>
            </div>
        `;
    }
}

// Cargar historia clínica
async function loadHistoriaClinica(codPaciente) {
    try {
        const response = await fetch(`${API_URL}/api/paciente/historia-clinica/${codPaciente}`);
        const data = await response.json();

        const container = document.getElementById('historiaClinica');

        if (data.success && data.historias && data.historias.length > 0) {
            container.innerHTML = `
                <div class="historia-clinica-content">
                    ${data.historias.map(historia => createHistoriaHTML(historia)).join('')}
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📄</div>
                    <p>No hay registros en la historia clínica</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error al cargar historia clínica:', error);
        document.getElementById('historiaClinica').innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <p>Error al cargar la historia clínica</p>
            </div>
        `;
    }
}

// Crear HTML para una cita
function createCitaHTML(cita) {
    const estadoClass = getEstadoClass(cita.estado);
    const fecha = formatDate(cita.fecha);
    const hora = cita.hora || 'No especificada';
    
    // La API devuelve medico.nombrePersona y medico.apellidoPersona directamente
    const medico = cita.medico && cita.medico.nombrePersona && cita.medico.apellidoPersona ? 
        `${cita.medico.nombrePersona} ${cita.medico.apellidoPersona}` : 
        'Médico no asignado';
    
    const tipoServicio = cita.tiposervicio || cita.tipoServicio || 'Consulta general';

    return `
        <div class="cita-item">
            <div class="cita-header">
                <span class="cita-fecha">📅 ${fecha} - ${hora}</span>
                <span class="cita-estado ${estadoClass}">${cita.estado}</span>
            </div>
            <div class="cita-details">
                <p><strong>Tipo:</strong> ${tipoServicio}</p>
                <p><strong>Médico:</strong> Dr. ${medico}</p>
            </div>
        </div>
    `;
}

// Crear HTML para historia clínica
function createHistoriaHTML(historia) {
    const diagnosticos = historia.diagnosticos || historia.registroDiagnostica || [];
    return `
        <div class="historia-item">
            <h4>📄 Historia Clínica #${historia.codHistoria}</h4>
            <p><strong>Código de Paciente:</strong> ${historia.codPaciente}</p>
            <p><strong>Documento:</strong> ${historia.numDocumento}</p>
            ${diagnosticos.length > 0 ? 
                `<div><strong>Diagnósticos registrados:</strong>
                    <ul>
                        ${diagnosticos.map(diag => `
                            <li>
                                <strong>Enfermedad:</strong> ${diag.nombreEnfermedad || diag.enfermedad?.nombreEnfermedad || 'No disponible'}<br>
                                <strong>Descripción:</strong> ${diag.descripcionEnfermedad || diag.enfermedad?.descripcionEnfermedad || 'No disponible'}<br>
                                <strong>Fecha:</strong> ${diag.fechaDiagnostico || diag.fechaRegistro || diag.fecha || 'No disponible'}
                            </li>
                        `).join('')}
                    </ul>
                </div>` 
                : '<p><em>Sin diagnósticos registrados</em></p>'}
        </div>
    `;
}

// Obtener clase CSS según el estado
function getEstadoClass(estado) {
    const estadoLower = estado.toLowerCase();
    if (estadoLower === 'programada') return 'estado-programada';
    if (estadoLower === 'completada') return 'estado-completada';
    if (estadoLower === 'cancelada') return 'estado-cancelada';
    return '';
}

// Formatear fecha
function formatDate(dateString) {
    if (!dateString) return 'Fecha no disponible';
    
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        timeZone: 'UTC'
    };
    
    return date.toLocaleDateString('es-ES', options);
}

// Mostrar error
function showError(message) {
    console.error(message);
    alert(message);
}

// Manejar logout
async function handleLogout() {
    if (!confirm('¿Está seguro que desea cerrar sesión?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            // Limpiar localStorage
            localStorage.removeItem('usuario');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userName');
            localStorage.removeItem('userId');
            localStorage.removeItem('numDocumento');
            localStorage.removeItem('codPaciente');
            
            // Redirigir al login
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        // Aún así redirigir al login
        localStorage.clear();
        window.location.href = '/login';
    }
}
