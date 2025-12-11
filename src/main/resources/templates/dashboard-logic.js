// dashboard-logic.js
const API_URL = 'http://localhost:8080';

// Estado global
const state = {
    usuario: null,
    currentDate: new Date(),
    todasLasCitas: [],
    empleadoInfo: null
};

// Inicialización principal
document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});

function initDashboard() {
    loadUserInfo();
    setupEventListeners();
}

function loadUserInfo() {
    const usuarioStr = localStorage.getItem("usuario");
    if (!usuarioStr) {
        window.location.href = "login.html";
        return;
    }

    try {
        state.usuario = JSON.parse(usuarioStr);
    } catch (e) {
        console.error("Error parsing user data", e);
        window.location.href = "login.html";
        return;
    }

    const { nombreUsuario, rol } = state.usuario;
    // Normalizar rol (capitalizado)
    const userRole = rol.charAt(0).toUpperCase() + rol.slice(1).toLowerCase();

    // Actualizar UI básica
    const userNameElement = document.getElementById("userName");
    const userRoleElement = document.getElementById("userRole");

    if (userNameElement) userNameElement.textContent = nombreUsuario || "Usuario";
    if (userRoleElement) userRoleElement.textContent = userRole || "Rol";

    // Cargar menú
    if (typeof loadMenuForRole === 'function') {
        loadMenuForRole(userRole);
    }

    // Actualizar fecha
    updateDate();

    // Cargar vista específica según rol
    loadRoleSpecificView(userRole);
}

function updateDate() {
    const now = new Date();
    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    };
    const dateElement = document.getElementById("currentDate");
    if (dateElement) {
        dateElement.textContent = now.toLocaleDateString("es-ES", options);
    }
}

function loadRoleSpecificView(role) {
    const contentArea = document.getElementById('contentArea');
    const medicoView = document.getElementById('medicoView');
    const pacienteView = document.getElementById('pacienteView');
    const defaultView = document.getElementById('contentGrid'); // La vista con las cards de bienvenida

    // Ocultar todo por defecto
    if (medicoView) medicoView.style.display = 'none';
    if (pacienteView) pacienteView.style.display = 'none';
    if (defaultView) defaultView.style.display = 'none'; // Se mostrará si no es médico ni paciente

    if (role === 'Medico' || role === 'M\u00E9dico') { // 'Médico'
        if (medicoView) {
            medicoView.style.display = 'block';
            loadMedicoDashboard();
        }
    } else if (role === 'Paciente') {
        if (pacienteView) {
            pacienteView.style.display = 'block'; // Asegurarse que es grid o block según CSS
            loadPacienteDashboard();
        }
    } else {
        // Mostrar vista por defecto (admin, secretaria, etc.)
        if (defaultView) defaultView.style.display = 'grid';
    }
}

// ==========================================
// LÓGICA DE MÉDICO
// ==========================================
async function loadMedicoDashboard() {
    console.log("Cargando dashboard médico...");
    // Cargar info extra del médico si es necesario
    try {
        const empleadosResponse = await fetch(`${API_URL}/api/empleados`);
        const empleados = await empleadosResponse.json();

        state.empleadoInfo = empleados.find(emp => emp.persona && emp.persona.numdocumento === state.usuario.numDocumento);

        // Actualizar título específico si existe el elemento
        const medicoNameEl = document.getElementById('medicoNameTitle');
        if (medicoNameEl && state.empleadoInfo) {
            medicoNameEl.textContent = `Dr. ${state.empleadoInfo.persona.nombrePersona} ${state.empleadoInfo.persona.apellidoPersona}`;
        }
    } catch (error) {
        console.error('Error al cargar info del médico:', error);
    }

    loadCitasMedico();
}

async function loadCitasMedico() {
    try {
        const response = await fetch(`${API_URL}/api/citas`);
        const todasCitas = await response.json();

        // Filtrar citas del médico actual
        state.todasLasCitas = todasCitas.filter(cita => {
            // El usuario médico debe coincidir con el médico de la cita
            // Asumiendo que cita.medico tiene estructura persona o numdocumento
            return cita.medico &&
                cita.medico.numdocumento === state.usuario.numDocumento &&
                cita.estado !== 'Cancelada';
        });

        renderCalendar();
    } catch (error) {
        console.error('Error al cargar citas:', error);
    }
}

function renderCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    const year = state.currentDate.getFullYear();
    const month = state.currentDate.getMonth();

    // Título del mes
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const currentMonthEl = document.getElementById('currentMonth');
    if (currentMonthEl) currentMonthEl.textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Domingo

    let calendarHTML = `
        <div class="calendar-header">Domingo</div>
        <div class="calendar-header">Lunes</div>
        <div class="calendar-header">Martes</div>
        <div class="calendar-header">Miércoles</div>
        <div class="calendar-header">Jueves</div>
        <div class="calendar-header">Viernes</div>
        <div class="calendar-header">Sábado</div>
    `;

    // Días vacíos
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarHTML += '<div class="calendar-day empty"></div>';
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
        const currentDayDate = new Date(year, month, day);
        // Formato YYYY-MM-DD local
        // Ojo con las zonas horarias. Usaremos una comparación simple.
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Filtrar citas que coincidan con la fecha (ignorando hora por ahora, asumiendo fecha es YYYY-MM-DD)
        const citasDelDia = state.todasLasCitas.filter(cita => {
            // cita.fecha puede venir con hora o no. Asumimos string YYYY-MM-DD o ISO
            return cita.fecha.startsWith(dateString);
        });
        const numCitas = citasDelDia.length;

        const today = new Date();
        const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

        let citasPreview = '';
        if (numCitas > 0) {
            citasPreview = citasDelDia.slice(0, 2).map(cita => {
                const hora = cita.hora || 'Sin hora';
                const paciente = cita.paciente?.persona?.nombrePersona
                    ? `${cita.paciente.persona.nombrePersona} ${cita.paciente.persona.apellidoPersona}`
                    : (cita.paciente?.nombrePersona ? `${cita.paciente.nombrePersona} ${cita.paciente.apellidoPersona}` : 'Paciente');
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

    calendarEl.innerHTML = calendarHTML;
}

function showCitasDelDia(dateString) {
    const citasDelDia = state.todasLasCitas.filter(cita => cita.fecha.startsWith(dateString));
    const container = document.getElementById('listaCitasDia');
    if (!container) return;

    if (citasDelDia.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">No hay citas programadas para este día</p>';
        return;
    }

    citasDelDia.sort((a, b) => (a.hora || '').localeCompare(b.hora || ''));

    container.innerHTML = citasDelDia.map(cita => {
        const pacienteNombre = getPacienteNombre(cita);
        const pacienteDoc = cita.paciente?.numdocumento || 'N/A';
        const estadoClass = (cita.estado || '').toLowerCase();

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
                <p><strong>📋 Servicio:</strong> ${cita.tiposervicio || 'General'}</p>
                ${cita.observaciones ? `<p><strong>📝 Observaciones:</strong> ${cita.observaciones}</p>` : ''}
            </div>
        `;
    }).join('');
}

function previousMonth() {
    state.currentDate.setMonth(state.currentDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    state.currentDate.setMonth(state.currentDate.getMonth() + 1);
    renderCalendar();
}

// ==========================================
// LÓGICA DE PACIENTE
// ==========================================
async function loadPacienteDashboard() {
    console.log("Cargando dashboard paciente...");
    const usuario = state.usuario;
    if (!usuario || !usuario.numDocumento) {
        console.error("No hay documento de usuario para cargar datos de paciente");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/pacientes/search/documento/${usuario.numDocumento}`);
        const data = await response.json();

        if (data.success && data.paciente) {
            const codPaciente = data.paciente.codPaciente;
            localStorage.setItem('codPaciente', codPaciente);
            // Cargar vista inicial
            switchPacienteView('welcome');
        } else {
            console.error('No se encontró información del paciente vinculada al usuario');
            document.getElementById('pacienteView').innerHTML = '<div class="alert alert-warning">No se encontró información de paciente asociada.</div>';
        }
    } catch (error) {
        console.error('Error al cargar datos del paciente:', error);
    }
}

function switchPacienteView(viewName) {
    const views = ['pacienteWelcomeView', 'pacienteCitasView', 'pacienteHistoriaView'];
    views.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    const codPaciente = localStorage.getItem('codPaciente');

    if (viewName === 'citas') {
        document.getElementById('pacienteCitasView').style.display = 'block';
        loadPacienteCalendar(codPaciente);
    } else if (viewName === 'historia') {
        document.getElementById('pacienteHistoriaView').style.display = 'block';
        loadHistoriaClinica(codPaciente);
    } else {
        const welcomeEl = document.getElementById('pacienteWelcomeView');
        if (welcomeEl) welcomeEl.style.display = 'block';
    }
}

async function loadPacienteCalendar(codPaciente) {
    try {
        const response = await fetch(`${API_URL}/api/citas`);
        const todasCitas = await response.json();

        // Filtrar citas del paciente actual
        state.todasLasCitas = todasCitas.filter(cita =>
            cita.paciente &&
            cita.paciente.numdocumento === state.usuario.numDocumento &&
            cita.estado !== 'Cancelada'
        );

        // Renderizar usando la función genérica
        renderCalendar({
            containerId: 'pacienteCalendar',
            monthId: 'pacienteCurrentMonth',
            isPaciente: true,
            filterFn: (cita, dateString) => cita.fecha.startsWith(dateString),
            onDayClick: (dateString) => showPacienteCitasDelDia(dateString)
        });

    } catch (error) {
        console.error('Error al cargar calendario de paciente:', error);
    }
}

function showPacienteCitasDelDia(dateString) {
    const citasDelDia = state.todasLasCitas.filter(cita => cita.fecha.startsWith(dateString));
    const container = document.getElementById('pacienteListaCitasDia');
    if (!container) return;

    if (citasDelDia.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay citas para este día.</p>';
        return;
    }

    container.innerHTML = citasDelDia.map(cita => {
        const medico = (cita.medico && cita.medico.nombrePersona) ?
            `Dr. ${cita.medico.nombrePersona} ${cita.medico.apellidoPersona}` : 'Sin asignar';

        const estadoClass = (cita.estado || '').toLowerCase();

        return `
            <div class="cita-card">
                 <div style="display: flex; justify-content: space-between;">
                    <strong>🕐 ${cita.hora || 'Sin hora'}</strong>
                    <span class="badge ${estadoClass}">${cita.estado}</span>
                 </div>
                 <p><strong>👨‍⚕️ Médico:</strong> ${medico}</p>
                 <p><strong>🏥 Servicio:</strong> ${cita.tiposervicio}</p>
                 ${cita.observaciones ? `<p><small>${cita.observaciones}</small></p>` : ''}
            </div>
         `;
    }).join('');
}


// GENERIC CALENDAR RENDERER
// Replaces the old renderCalendar to support config
function renderCalendar(config) {
    // Config defaults target the medico view for backward compatibility if called without args
    const containerId = config?.containerId || 'calendar';
    const monthId = config?.monthId || 'currentMonth';
    const calendarEl = document.getElementById(containerId);
    if (!calendarEl) return;

    const year = state.currentDate.getFullYear();
    const month = state.currentDate.getMonth();

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    document.getElementById(monthId).textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    let calendarHTML = `
        <div class="calendar-header">Domingo</div>
        <div class="calendar-header">Lunes</div>
        <div class="calendar-header">Martes</div>
        <div class="calendar-header">Miércoles</div>
        <div class="calendar-header">Jueves</div>
        <div class="calendar-header">Viernes</div>
        <div class="calendar-header">Sábado</div>
    `;

    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarHTML += '<div class="calendar-day empty"></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Filter logic
        let citasDelDia = [];
        if (config && config.filterFn) {
            citasDelDia = state.todasLasCitas.filter(c => config.filterFn(c, dateString));
        } else {
            // Default (Medico) legacy behavior
            citasDelDia = state.todasLasCitas.filter(cita => cita.fecha.startsWith(dateString));
        }

        const numCitas = citasDelDia.length;
        const today = new Date();
        const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

        let citasPreview = '';
        if (numCitas > 0) {
            citasPreview = citasDelDia.slice(0, 2).map(cita => {
                // Determine label based on context (Patient sees Doctor, Doctor sees Patient)
                let label = '';
                if (config?.isPaciente) {
                    label = (cita.medico?.persona?.nombrePersona) ? `Dr. ${cita.medico.persona.apellidoPersona}` : 'Médico';
                } else {
                    label = (cita.paciente?.persona?.nombrePersona) ?
                        `${cita.paciente.persona.nombrePersona} ${cita.paciente.persona.apellidoPersona}` : 'Paciente';
                }
                const hora = cita.hora || '';
                return `<div class="cita-preview">🕐 ${hora} - ${label}</div>`;
            }).join('');
            if (numCitas > 2) citasPreview += `<div class="cita-preview">+${numCitas - 2} más...</div>`;
        }

        // OnClick handler
        const clickHandler = config?.onDayClick ? `showPacienteCitasDelDia('${dateString}')` : `showCitasDelDia('${dateString}')`;
        // Hack: function name needs to be globally accessible or logic changed. 
        // We will stick to global functions for now.
        // For distinct handlers, we need dynamic function names or pass identifiers.
        // Let's use a workaround: The `onclick` attribute string needs the exact function name.

        let clickAttr = "";
        if (config?.isPaciente) {
            clickAttr = `showPacienteCitasDelDia('${dateString}')`;
        } else {
            clickAttr = `showCitasDelDia('${dateString}')`;
        }

        calendarHTML += `
            <div class="calendar-day ${isToday ? 'today' : ''} ${numCitas > 0 ? 'has-appointments' : ''}" 
                 onclick="${clickAttr}">
                <span class="day-number">${day}</span>
                ${numCitas > 0 ? `<span class="appointment-count">${numCitas} cita${numCitas > 1 ? 's' : ''}</span>` : ''}
                ${citasPreview}
            </div>
        `;
    }

    calendarEl.innerHTML = calendarHTML;
}

async function loadHistoriaClinica(codPaciente) {
    const container = document.getElementById('historiaClinica');
    if (!container) return;

    try {
        const response = await fetch(`${API_URL}/api/historias-clinicas/paciente/${codPaciente}`);
        const data = await response.json();

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
        console.error("Error loading clinical history", error);
    }
}

// Helpers
function createHistoriaHTML(historia) {
    const diagnosticos = historia.diagnosticos || [];
    const medicamentos = historia.medicamentos || [];

    // Obtener información del paciente del estado global
    const pacienteNombre = state.usuario.nombreUsuario || 'Paciente'; // Fallback
    const pacienteDoc = state.usuario.numDocumento || 'N/A';

    return `
        <div class="historia-card" style="background: white; border-radius: 12px; padding: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 25px;">
            <div style="border-bottom: 2px solid #f0f0f0; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="color: #4a5568; margin: 0; display: flex; align-items: center; gap: 10px;">
                    <span style="background: #e2e8f0; padding: 8px; border-radius: 8px;">📄</span>
                    Historia Clínica #${historia.codHistoria}
                </h3>
                <span class="badge" style="background: #ebf8ff; color: #3182ce;">Activa</span>
            </div>

            <!-- Información del Paciente -->
            <div style="margin-bottom: 25px;">
                <h4 class="section-title" style="font-size: 1rem; color: #718096; border-bottom: 1px solid #edf2f7; padding-bottom: 5px; margin-bottom: 10px;">
                    👤 Información del Paciente
                </h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <div>
                        <strong style="display: block; font-size: 0.85em; color: #a0aec0;">NOMBRE COMPLETO</strong>
                        <span style="color: #2d3748; font-weight: 500;">${pacienteNombre}</span>
                    </div>
                    <div>
                        <strong style="display: block; font-size: 0.85em; color: #a0aec0;">DOCUMENTO</strong>
                        <span style="color: #2d3748; font-weight: 500;">${pacienteDoc}</span>
                    </div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                <!-- Diagnósticos -->
                <div>
                    <h4 class="section-title" style="font-size: 1rem; color: #e53e3e; border-bottom: 1px solid #fff5f5; padding-bottom: 5px; margin-bottom: 15px;">
                        🩺 Diagnósticos
                    </h4>
                    ${diagnosticos.length > 0 ?
            `<ul style="list-style: none; padding: 0;">
                            ${diagnosticos.map(diag => `
                                <li style="background: #fff5f5; border-left: 3px solid #e53e3e; padding: 10px; margin-bottom: 10px; border-radius: 0 8px 8px 0;">
                                    <strong style="color: #c53030; display: block;">${diag.nombreEnfermedad || 'Enfermedad'}</strong>
                                    <span style="color: #742a2a; font-size: 0.9em;">${diag.descripcionEnfermedad || 'Sin descripción'}</span>
                                </li>
                            `).join('')}
                        </ul>` :
            '<p style="color: #a0aec0; font-style: italic;">No hay diagnósticos registrados</p>'
        }
                </div>

                <!-- Prescripciones -->
                <div>
                    <h4 class="section-title" style="font-size: 1rem; color: #38a169; border-bottom: 1px solid #f0fff4; padding-bottom: 5px; margin-bottom: 15px;">
                        💊 Prescripciones
                    </h4>
                    ${medicamentos.length > 0 ?
            `<div style="display: flex; flex-direction: column; gap: 10px;">
                            ${medicamentos.map(med => `
                                <div style="background: #f0fff4; border: 1px solid #c6f6d5; padding: 10px; border-radius: 8px;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                        <strong style="color: #2f855a;">${med.nombreMedicamento || 'Medicamento'}</strong>
                                        <span style="font-size: 0.85em; color: #276749; background: #c6f6d5; padding: 2px 6px; border-radius: 4px;">${med.dosis || 'N/A'}</span>
                                    </div>
                                    <div style="font-size: 0.85em; color: #48bb78;">
                                        <div>🕒 ${med.frecuencia || 'N/A'}</div>
                                        <div>📅 ${med.duracion || 'N/A'}</div>
                                    </div>
                                    ${med.fechaPrescripcion ? `<div style="font-size: 0.75em; color: #9ae6b4; margin-top: 5px; text-align: right;">${med.fechaPrescripcion}</div>` : ''}
                                </div>
                            `).join('')}
                        </div>` :
            '<p style="color: #a0aec0; font-style: italic;">No hay prescripciones registradas</p>'
        }
                </div>
            </div>
            
            ${historia.detalles ? `
                <div style="margin-top: 20px; background: #f7fafc; padding: 15px; border-radius: 8px;">
                    <strong style="color: #4a5568;">📝 Observaciones Generales:</strong>
                    <p style="color: #718096; margin-top: 5px;">${historia.detalles}</p>
                </div>
            ` : ''}
        </div>
    `;
}

function getPacienteNombre(cita) {
    if (cita.paciente && cita.paciente.persona) {
        return `${cita.paciente.persona.nombrePersona} ${cita.paciente.persona.apellidoPersona}`;
    } else if (cita.paciente && cita.paciente.nombrePersona) {
        return `${cita.paciente.nombrePersona} ${cita.paciente.apellidoPersona}`;
    }
    return 'Paciente';
}

function setupEventListeners() {
    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
        btn.onclick = logout;
    });
}
