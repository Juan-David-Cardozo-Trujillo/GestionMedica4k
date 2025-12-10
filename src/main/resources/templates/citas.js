// citas.js
const API_URL = 'http://localhost:8080/api';
let currentAppointment = null;
let allAppointments = [];
let patients = [];
let doctors = [];
let currentDate = new Date();
let viewMode = 'calendar'; // 'calendar' o 'list'

// Meses en español
const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', () => {
    loadAppointments();
    loadPatients();
    loadDoctors();
    renderCalendar();
    setMinDate();
});

// Establecer fecha mínima (hoy)
function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('fecha').min = today;
}

// Cargar citas
async function loadAppointments() {
    try {
        console.log('Intentando cargar citas desde:', `${API_URL}/citas`);
        const response = await fetch(`${API_URL}/citas`);
        
        console.log('Respuesta recibida:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error en respuesta:', errorText);
            throw new Error('Error al cargar citas');
        }
        
        const data = await response.json();
        console.log('Datos de citas recibidos:', data);
        
        allAppointments = data;
        if (viewMode === 'list') {
            renderAppointmentsList(allAppointments);
        }
        renderCalendar();
    } catch (error) {
        console.error('Error detallado:', error);
        showNotification('Error al cargar las citas: ' + error.message, 'error');
    }
}

// Cargar pacientes
async function loadPatients() {
    try {
        console.log('Cargando pacientes desde:', `${API_URL}/pacientes`);
        const response = await fetch(`${API_URL}/pacientes`);
        console.log('Respuesta pacientes:', response.status);
        
        if (!response.ok) {
            throw new Error('Error al cargar pacientes');
        }
        
        patients = await response.json();
        console.log('Pacientes cargados:', patients.length);
        populatePatientSelect();
    } catch (error) {
        console.error('Error al cargar pacientes:', error);
        showNotification('Error al cargar pacientes', 'error');
    }
}

// Cargar médicos
async function loadDoctors() {
    try {
        console.log('Cargando empleados desde:', `${API_URL}/empleados`);
        const response = await fetch(`${API_URL}/empleados`);
        console.log('Respuesta empleados:', response.status);
        
        if (!response.ok) {
            throw new Error('Error al cargar empleados');
        }
        
        const empleados = await response.json();
        console.log('Empleados cargados:', empleados.length);
        console.log('Empleados recibidos:', empleados);
        // Filtrar solo los médicos (aceptar diferentes variaciones)
        doctors = empleados.filter(emp => emp.cargo && (
            emp.cargo.toLowerCase() === 'medico' || 
            emp.cargo.toLowerCase() === 'médico' ||
            emp.cargo.toLowerCase().includes('medic')
        ));
        console.log('Médicos filtrados:', doctors.length);
        console.log('Médicos:', doctors);
        populateDoctorSelect();
        populateDoctorFilter();
    } catch (error) {
        console.error('Error al cargar médicos:', error);
        showNotification('Error al cargar médicos', 'error');
    }
}

// Poblar select de pacientes
function populatePatientSelect() {
    const select = document.getElementById('codPaciente');
    select.innerHTML = '<option value="">Seleccione un paciente</option>';
    patients.forEach(p => {
        select.innerHTML += `
            <option value="${p.codpaciente}" data-documento="${p.numdocumento}">
                ${p.nombrePersona} ${p.apellidoPersona} - ${p.numdocumento}
            </option>
        `;
    });
}

// Poblar select de médicos
function populateDoctorSelect() {
    const select = document.getElementById('medico');
    console.log('Poblando select de médicos, total:', doctors.length);
    select.innerHTML = '<option value="">Seleccione un médico</option>';
    doctors.forEach(d => {
        console.log('Procesando médico:', d);
        const nombreCompleto = d.persona ? `${d.persona.nombrePersona || ''} ${d.persona.apellidoPersona || ''}`.trim() : 'Sin nombre';
        const departamento = d.departamento ? d.departamento.nombredepartamento : 'Sin departamento';
        console.log('Nombre completo:', nombreCompleto, 'Departamento:', departamento);
        select.innerHTML += `
            <option value="${d.idEmpleado}" data-documento="${d.numDocumento}">
                Dr(a). ${nombreCompleto} - ${departamento}
            </option>
        `;
    });
    console.log('Select HTML final:', select.innerHTML);
}

// Poblar filtro de médicos
function populateDoctorFilter() {
    const select = document.getElementById('filterMedico');
    doctors.forEach(d => {
        const nombreCompleto = d.persona ? `${d.persona.nombrePersona || ''} ${d.persona.apellidoPersona || ''}`.trim() : 'Sin nombre';
        select.innerHTML += `
            <option value="${d.idEmpleado}">
                Dr(a). ${nombreCompleto}
            </option>
        `;
    });
}

// Renderizar calendario
function renderCalendar() {
    const calendar = document.getElementById('calendar');
    const monthTitle = document.getElementById('currentMonth');
    
    // Actualizar título
    monthTitle.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    // Obtener primer y último día del mes
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    // Limpiar calendario
    calendar.innerHTML = '';
    
    // Encabezados de días
    const dayHeaders = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day-header';
        header.textContent = day;
        calendar.appendChild(header);
    });
    
    // Días vacíos antes del primer día
    for (let i = 0; i < startingDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendar.appendChild(emptyDay);
    }
    
    // Días del mes
    for (let day = 1; day <= totalDays; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        
        const currentDayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (currentDayDate.getTime() === today.getTime()) {
            dayDiv.classList.add('today');
        }
        
        dayDiv.innerHTML = `<div class="day-number">${day}</div>`;
        
        // Filtrar citas de este día
        const dayAppointments = allAppointments.filter(apt => {
            const aptDate = new Date(apt.fecha);
            return aptDate.getDate() === day && 
                   aptDate.getMonth() === currentDate.getMonth() && 
                   aptDate.getFullYear() === currentDate.getFullYear();
        });
        
        // Agregar citas al día
        if (dayAppointments.length > 0) {
            const appointmentsContainer = document.createElement('div');
            appointmentsContainer.className = 'day-appointments';
            
            dayAppointments.slice(0, 3).forEach(apt => {
                const pacienteNombre = apt.paciente && apt.paciente.nombrePersona
                    ? apt.paciente.nombrePersona
                    : 'Paciente';
                
                const aptDiv = document.createElement('div');
                aptDiv.className = `appointment-item ${apt.estado.toLowerCase()}`;
                aptDiv.innerHTML = `
                    <span class="apt-time">${apt.hora.substring(0, 5)}</span>
                    <span class="apt-patient">${pacienteNombre}</span>
                `;
                aptDiv.onclick = (e) => {
                    e.stopPropagation();
                    showAppointmentDetails(apt.idcita);
                };
                appointmentsContainer.appendChild(aptDiv);
            });
            
            if (dayAppointments.length > 3) {
                const moreDiv = document.createElement('div');
                moreDiv.className = 'more-appointments';
                moreDiv.textContent = `+${dayAppointments.length - 3} más`;
                appointmentsContainer.appendChild(moreDiv);
            }
            
            dayDiv.appendChild(appointmentsContainer);
        }
        
        // Click en el día para crear cita
        dayDiv.onclick = () => {
            const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dateString = selectedDate.toISOString().split('T')[0];
            document.getElementById('fecha').value = dateString;
            openModal();
        };
        
        calendar.appendChild(dayDiv);
    }
}

// Mes anterior
function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

// Mes siguiente
function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

// Cambiar vista
function toggleView() {
    viewMode = viewMode === 'calendar' ? 'list' : 'calendar';
    
    const calendarView = document.getElementById('calendarView');
    const listView = document.getElementById('listView');
    const toggleText = document.getElementById('viewToggleText');
    
    if (viewMode === 'calendar') {
        calendarView.style.display = 'block';
        listView.style.display = 'none';
        toggleText.textContent = '📋 Ver Lista';
        renderCalendar();
    } else {
        calendarView.style.display = 'none';
        listView.style.display = 'block';
        toggleText.textContent = '📅 Ver Calendario';
        renderAppointmentsList(allAppointments);
    }
}

// Renderizar lista de citas
function renderAppointmentsList(appointments) {
    const tbody = document.getElementById('appointmentsBody');
    tbody.innerHTML = '';
    
    if (appointments.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="8" style="text-align:center; padding:40px;">
                No hay citas registradas
            </td></tr>
        `;
        return;
    }
    
    appointments.forEach(apt => {
        const pacienteNombre = apt.paciente && apt.paciente.nombrePersona && apt.paciente.apellidoPersona
            ? `${apt.paciente.nombrePersona} ${apt.paciente.apellidoPersona}`
            : 'N/A';
        
        const medicoNombre = apt.medico && apt.medico.nombrePersona && apt.medico.apellidoPersona
            ? `${apt.medico.nombrePersona} ${apt.medico.apellidoPersona}`
            : 'N/A';
        
        const row = `
            <tr onclick="showAppointmentDetails(${apt.idcita})" style="cursor:pointer;">
                <td>${apt.idcita}</td>
                <td>${new Date(apt.fecha).toLocaleDateString('es-ES')}</td>
                <td>${apt.hora.substring(0, 5)}</td>
                <td>${pacienteNombre}</td>
                <td>Dr(a). ${medicoNombre}</td>
                <td>${apt.tiposervicio}</td>
                <td><span class="status-badge ${apt.estado.toLowerCase()}">${apt.estado}</span></td>
                <td onclick="event.stopPropagation();">
                    <button class="btn-icon" onclick="editAppointment(${apt.idcita})" title="Editar">✏️</button>
                    <button class="btn-icon" onclick="deleteAppointment(${apt.idcita})" title="Eliminar">🗑️</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// Mostrar detalles de cita
async function showAppointmentDetails(idCita) {
    try {
        const response = await fetch(`${API_URL}/citas/${idCita}`);
        
        const apt = await response.json();
        
        const pacienteNombre = apt.paciente && apt.paciente.nombrePersona && apt.paciente.apellidoPersona
            ? `${apt.paciente.nombrePersona} ${apt.paciente.apellidoPersona}`
            : 'N/A';
        
        const medicoNombre = apt.medico && apt.medico.nombrePersona && apt.medico.apellidoPersona
            ? `${apt.medico.nombrePersona} ${apt.medico.apellidoPersona}`
            : 'N/A';
        
        document.getElementById('appointmentDetails').innerHTML = `
            <div class="detail-row">
                <strong>ID Cita:</strong> <span>${apt.idcita}</span>
            </div>
            <div class="detail-row">
                <strong>Fecha:</strong> <span>${new Date(apt.fecha).toLocaleDateString('es-ES')}</span>
            </div>
            <div class="detail-row">
                <strong>Hora:</strong> <span>${apt.hora.substring(0, 5)}</span>
            </div>
            <div class="detail-row">
                <strong>Paciente:</strong> <span>${pacienteNombre}</span>
            </div>
            <div class="detail-row">
                <strong>Médico:</strong> <span>Dr(a). ${medicoNombre}</span>
            </div>
            <div class="detail-row">
                <strong>Tipo:</strong> <span>${apt.tiposervicio}</span>
            </div>
            <div class="detail-row">
                <strong>Estado:</strong> <span class="status-badge ${apt.estado.toLowerCase()}">${apt.estado}</span>
            </div>
        `;
        
        currentAppointment = apt;
        document.getElementById('detailsModal').style.display = 'block';
    } catch (error) {
        showNotification('Error al cargar detalles', 'error');
    }
}

// Abrir modal para crear/editar
function openModal(appointment = null) {
    const modal = document.getElementById('appointmentModal');
    const form = document.getElementById('appointmentForm');
    const title = document.getElementById('modalTitle');
    
    if (appointment) {
        title.textContent = 'Editar Cita';
        currentAppointment = appointment;
        
        document.getElementById('codPaciente').value = appointment.codpaciente;
        document.getElementById('medico').value = appointment.numdocumentoemp;
        document.getElementById('fecha').value = appointment.fecha;
        document.getElementById('hora').value = appointment.hora;
        document.getElementById('tipoServicio').value = appointment.tiposervicio;
        document.getElementById('estado').value = appointment.estado;
    } else {
        title.textContent = 'Nueva Cita';
        currentAppointment = null;
        form.reset();
    }
    
    modal.style.display = 'block';
}

// Cerrar modales
function closeModal() {
    document.getElementById('appointmentModal').style.display = 'none';
    currentAppointment = null;
}

function closeDetailsModal() {
    document.getElementById('detailsModal').style.display = 'none';
    currentAppointment = null;
}

// Editar desde detalles
function editFromDetails() {
    closeDetailsModal();
    editAppointment(currentAppointment.idcita);
}

// Guardar cita
async function saveAppointment(event) {
    event.preventDefault();

    const esNuevo = !currentAppointment; // Determinar si es INSERT o UPDATE
    
    const patientSelect = document.getElementById('codPaciente');
    const doctorSelect = document.getElementById('medico');
    
    const data = {
        codpaciente: parseInt(patientSelect.value),
        numdocumento: parseInt(patientSelect.selectedOptions[0].dataset.documento),
        idempleado: parseInt(doctorSelect.value),
        numdocumentoempleado: parseInt(doctorSelect.selectedOptions[0].dataset.documento),
        fecha: document.getElementById('fecha').value,
        hora: document.getElementById('hora').value + ':00',
        tiposervicio: document.getElementById('tipoServicio').value,
        estado: document.getElementById('estado').value
    };
    
    try {
        const url = currentAppointment 
            ? `${API_URL}/citas/${currentAppointment.idcita}`
            : `${API_URL}/citas`;
        const method = currentAppointment ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al guardar');
        }

        const accion = esNuevo ? 'INSERT' : 'UPDATE';
        await registrarAuditoria(accion, 'citas');
        
        showNotification('Cita guardada correctamente', 'success');
        closeModal();
        loadAppointments();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al guardar la cita: ' + error.message, 'error');
    }
}

// Editar cita
async function editAppointment(idCita) {
    try {
        const response = await fetch(`${API_URL}/citas/${idCita}`);
        const apt = await response.json();
        openModal(apt);
    } catch (error) {
        showNotification('Error al cargar cita', 'error');
    }
}

// Eliminar cita
async function deleteAppointment(idCita) {
    if (!confirm('¿Eliminar esta cita?')) return;
    
    try {
        const response = await fetch(`${API_URL}/citas/${idCita}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Error');

        await registrarAuditoria('DELETE', 'citas');

        showNotification('Cita eliminada', 'success');
        loadAppointments();
    } catch (error) {
        showNotification('Error al eliminar', 'error');
    }
}

// Cancelar cita
async function cancelAppointment() {
    if (!confirm('¿Cancelar esta cita?')) return;
    
    try {
        await fetch(`${API_URL}/citas/${currentAppointment.idcita}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ...currentAppointment, estado: 'Cancelada' })
        });
        

        await registrarAuditoria('UPDATE', 'citas');
        
        showNotification('Cita cancelada', 'success');
        closeDetailsModal();
        loadAppointments();
    } catch (error) {
        showNotification('Error', 'error');
    }
}

// Filtrar citas
function filterAppointments() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const estado = document.getElementById('filterEstado').value;
    const fecha = document.getElementById('filterFecha').value;
    const medico = document.getElementById('filterMedico').value;
    
    const filtered = allAppointments.filter(apt => {
        const pacienteNombre = apt.paciente && apt.paciente.nombrepersona && apt.paciente.apellidopersona
            ? `${apt.paciente.nombrepersona} ${apt.paciente.apellidopersona}`.toLowerCase()
            : '';
        
        const medicoNombre = apt.medico && apt.medico.nombrepersona && apt.medico.apellidopersona
            ? `${apt.medico.nombrepersona} ${apt.medico.apellidopersona}`.toLowerCase()
            : '';
        
        const matchSearch = pacienteNombre.includes(search) || medicoNombre.includes(search);
        const matchEstado = !estado || apt.estado === estado;
        const matchFecha = !fecha || apt.fecha === fecha;
        const matchMedico = !medico || (apt.medico && apt.medico.idempleado == medico);
        
        return matchSearch && matchEstado && matchFecha && matchMedico;
    });
    
    renderAppointmentsList(filtered);
}

// Notificaciones
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} show`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}