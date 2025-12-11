// citas.js
const API_URL = 'http://localhost:8080/api';
let currentAppointment = null;
let allAppointments = [];
let patients = [];
let doctors = [];
let currentDate = new Date();
let viewMode = 'list'; // 'list' only

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
    setMinDate();
    checkPermissions();
});

// Verificar permisos
function checkPermissions() {
    const role = localStorage.getItem('userRole');
    if (role === 'Medico' || role === 'Médico') {
        const btnNuevaCita = document.getElementById('btnNuevaCita');
        if (btnNuevaCita) btnNuevaCita.style.display = 'none';
    }
}

// Establecer fecha mínima (hoy)
function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('fecha').min = today;
}

// Cargar citas
async function loadAppointments() {
    try {
        let url = `${API_URL}/citas`;
        const role = localStorage.getItem('userRole');
        const idEmpleado = localStorage.getItem('idEmpleado');

        if ((role === 'Medico' || role === 'Médico') && idEmpleado) {
            console.log('Filtrando citas para médico con ID:', idEmpleado);
            url += `?idEmpleado=${idEmpleado}`;
        }

        console.log('Intentando cargar citas desde:', url);
        const response = await fetch(url);

        console.log('Respuesta recibida:', response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error en respuesta:', errorText);
            throw new Error('Error al cargar citas');
        }

        const data = await response.json();
        console.log('Datos de citas recibidos:', data);

        allAppointments = data;
        // Always render list
        renderAppointmentsList(allAppointments);

        // Auditoría de Lectura
        await registrarAuditoria('SELECT', 'citas');

    } catch (error) {
        console.error('Error detallado:', error);
        showNotification('Error al cargar las citas: ' + error.message, 'error');
    }
}

// Cargar pacientes
async function loadPatients() {
    try {
        const response = await fetch(`${API_URL}/pacientes`);
        if (!response.ok) throw new Error('Error al cargar pacientes');
        patients = await response.json();
        populatePatientSelect();
    } catch (error) {
        console.error('Error al cargar pacientes:', error);
        showNotification('Error al cargar pacientes', 'error');
    }
}

// Cargar médicos
async function loadDoctors() {
    try {
        const response = await fetch(`${API_URL}/empleados`);
        if (!response.ok) throw new Error('Error al cargar empleados');
        const empleados = await response.json();
        doctors = empleados.filter(emp => emp.cargo && (
            emp.cargo.toLowerCase() === 'medico' ||
            emp.cargo.toLowerCase() === 'médico' ||
            emp.cargo.toLowerCase().includes('medic')
        ));
        populateDoctorSelect();
    } catch (error) {
        console.error('Error al cargar médicos:', error);
        showNotification('Error al cargar médicos', 'error');
    }
}

// Poblar select de pacientes
function populatePatientSelect() {
    const select = document.getElementById('codPaciente');
    if (!select) return;
    select.innerHTML = '<option value="">Seleccione un paciente</option>';
    patients.forEach(p => {
        select.innerHTML += `
            <option value="${p.codPaciente}" data-documento="${p.numDocumento}">
                ${p.nombrePersona} ${p.apellidoPersona} - ${p.numDocumento}
            </option>
        `;
    });
}

// Poblar select de médicos
function populateDoctorSelect() {
    const select = document.getElementById('medico');
    if (!select) return;
    select.innerHTML = '<option value="">Seleccione un médico</option>';
    doctors.forEach(d => {
        const nombreCompleto = d.persona ? `${d.persona.nombrePersona || ''} ${d.persona.apellidoPersona || ''}`.trim() : 'Sin nombre';
        const departamento = d.departamento ? d.departamento.nombredepartamento : 'Sin departamento';
        select.innerHTML += `
            <option value="${d.idEmpleado}" data-documento="${d.numDocumento}">
                Dr(a). ${nombreCompleto} - ${departamento}
            </option>
        `;
    });
}

// Renderizar lista de citas
function renderAppointmentsList(appointments) {
    const userRole = localStorage.getItem('userRole');
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

        // Botones de acción según rol y estado
        let acciones = `
            <button class="btn-icon" onclick="showAppointmentDetails(${apt.idcita})" title="Ver Detalles">👁️</button>
        `;

        // Si es médico y la cita está pendiente, mostrar botón Diagnosticar
        if ((userRole === 'Medico' || userRole === 'Médico') && apt.estado === 'Pendiente') {
            acciones += `
                <button class="btn-icon" onclick="openDiagnosisModal(${apt.idcita})" title="Diagnosticar y Prescribir" style="background-color: #e3f2fd; color: #1976d2; font-size: 1.1em; width: auto; padding: 0 8px;">🩺+💊</button>
            `;
        }

        // Si NO es médico, mostrar opciones de edición/cancelación si está pendiente
        if (userRole !== 'Medico' && userRole !== 'Médico' && apt.estado === 'Pendiente') {
            acciones += `
                <button class="btn-icon" onclick="editAppointment(${apt.idcita})" title="Editar">✏️</button>
                <button class="btn-icon" onclick="deleteAppointment(${apt.idcita})" title="Eliminar/Cancelar">🗑️</button>
            `;
        }

        const row = `
            <tr style="cursor:pointer;">
                <td>${apt.idcita}</td>
                <td>${new Date(apt.fecha).toLocaleDateString('es-ES')}</td>
                <td>${apt.hora.substring(0, 5)}</td>
                <td>${pacienteNombre}</td>
                <td>Dr(a). ${medicoNombre}</td>
                <td>${apt.tiposervicio}</td>
                <td><span class="status-badge ${apt.estado.toLowerCase()}">${apt.estado}</span></td>
                <td onclick="event.stopPropagation();">${acciones}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    // Ya no ocultamos la columna acciones para médicos, porque ahora tiene el botón diagnosticar
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

        // Ocultar botones de acción si es médico
        const role = localStorage.getItem('userRole');
        if (role === 'Medico' || role === 'Médico') {
            const btnEdit = document.querySelector('#detailsModal .btn-primary');
            const btnCancel = document.querySelector('#detailsModal .btn-warning');
            if (btnEdit) btnEdit.style.display = 'none';
            if (btnCancel) btnCancel.style.display = 'none';
        } else {
            // Asegurar que estén visibles para otros roles
            const btnEdit = document.querySelector('#detailsModal .btn-primary');
            const btnCancel = document.querySelector('#detailsModal .btn-warning');
            if (btnEdit) btnEdit.style.display = 'inline-block';
            if (btnCancel) btnCancel.style.display = 'inline-block';
        }

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

        // Mapeo seguro de datos anidados
        const codPaciente = appointment.paciente ? appointment.paciente.codPaciente : '';
        const idMedico = appointment.medico ? appointment.medico.idempleado : '';

        document.getElementById('codPaciente').value = codPaciente;
        document.getElementById('medico').value = idMedico;
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

// --- LÓGICA DE DIAGNÓSTICO (SOLO MÉDICOS) ---

let currentPrescriptions = [];

function addPrescriptionRow() {
    const select = document.getElementById('prescMedicina');
    const dosis = document.getElementById('prescDosis').value;
    const frecuencia = document.getElementById('prescFrecuencia').value;
    const duracion = document.getElementById('prescDuracion').value;

    if (!select.value || !dosis || !frecuencia || !duracion) {
        alert('Por favor complete todos los campos de la prescripción');
        return;
    }

    const codMed = parseInt(select.value);

    // Verificar Duplicados
    const exists = currentPrescriptions.some(p => p.codMed === codMed);
    if (exists) {
        alert('Este medicamento ya está en la lista. Elimínelo si desea agregarlo de nuevo.');
        return;
    }

    const presc = {
        codMed: codMed,
        nombreMed: select.options[select.selectedIndex].text,
        dosis: dosis,
        frecuencia: frecuencia,
        duracion: duracion
    };

    currentPrescriptions.push(presc);
    renderPrescriptionsTable();

    // Limpiar inputs de prescripción
    select.value = "";
    document.getElementById('prescDosis').value = "";
    document.getElementById('prescFrecuencia').value = "";
    document.getElementById('prescDuracion').value = "";
}

function removePrescriptionRow(index) {
    currentPrescriptions.splice(index, 1);
    renderPrescriptionsTable();
}

function renderPrescriptionsTable() {
    const tbody = document.getElementById('prescriptionsBody');
    tbody.innerHTML = '';

    currentPrescriptions.forEach((p, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${p.nombreMed}</td>
                <td>${p.dosis}</td>
                <td>${p.frecuencia}</td>
                <td>${p.duracion}</td>
                <td>
                    <button type="button" class="btn-icon" onclick="removePrescriptionRow(${index})" style="color:red;">🗑️</button>
                </td>
            </tr>
        `;
    });
}

async function openDiagnosisModal(idCita) {
    document.getElementById('diagnosisCitaId').value = idCita;

    // Limpiar formulario y tabla
    document.getElementById('diagnosisForm').reset();
    currentPrescriptions = [];
    renderPrescriptionsTable();

    const token = localStorage.getItem('token');

    // Cargar enfermedades si no están cargadas
    const select = document.getElementById('diagnosisEnfermedad');
    if (select.options.length <= 1) {
        try {
            const response = await fetch(`${API_URL}/enfermedades`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const enfermedades = await response.json();

            select.innerHTML = '<option value="">Seleccione una enfermedad</option>';
            enfermedades.forEach(e => {
                select.innerHTML += `<option value="${e.idEnfermedad}">${e.nombreEnfermedad}</option>`;
            });
        } catch (error) {
            console.error('Error cargando enfermedades:', error);
            alert('Error al cargar lista de enfermedades');
        }
    }

    // Cargar medicamentos
    const selectMedicina = document.getElementById('prescMedicina');
    try {
        const response = await fetch(`${API_URL}/medicamentos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const medicamentos = await response.json();

        selectMedicina.innerHTML = '<option value="">Seleccione...</option>';
        medicamentos.forEach(m => {
            selectMedicina.innerHTML += `<option value="${m.codMed}">${m.nombreMed} - ${m.descripcion}</option>`;
        });
    } catch (error) {
        console.error('Error cargando medicamentos:', error);
    }

    document.getElementById('diagnosisModal').style.display = 'block';
}

function closeDiagnosisModal() {
    document.getElementById('diagnosisModal').style.display = 'none';
    document.getElementById('diagnosisForm').reset();
    currentPrescriptions = [];
}

async function saveDiagnosis(event) {
    event.preventDefault();

    const idCita = document.getElementById('diagnosisCitaId').value;
    const idEnfermedad = document.getElementById('diagnosisEnfermedad').value;

    if (!idEnfermedad) {
        alert('Debe seleccionar una enfermedad');
        return;
    }

    try {
        // 1. Guardar Diagnóstico
        const responseDiag = await fetch(`${API_URL}/citas/${idCita}/diagnostico`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                idEnfermedad: idEnfermedad
            })
        });

        const dataDiag = await responseDiag.json();

        if (!dataDiag.success) {
            throw new Error(dataDiag.message || 'Error al guardar diagnóstico');
        }

        // 2. Guardar Prescripciones (si hay)
        if (currentPrescriptions.length > 0) {
            for (const presc of currentPrescriptions) {
                const responsePresc = await fetch(`${API_URL}/citas/${idCita}/prescripcion`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        codMed: presc.codMed,
                        dosis: presc.dosis,
                        frecuencia: presc.frecuencia,
                        duracion: presc.duracion
                    })
                });

                if (!responsePresc.ok) {
                    const text = await responsePresc.text();
                    console.error('Error detallado del servidor:', text);
                    throw new Error(`Error ${responsePresc.status} guardando prescripción: ${text}`);
                }

                const dataPresc = await responsePresc.json();
                if (!dataPresc.success) {
                    console.error('Error guardando prescripción:', presc, dataPresc.message);
                }
            }
        }

        alert('Diagnóstico y prescripciones registrados correctamente');

        // Registrar Auditoría
        await registrarAuditoria('INSERT', 'historias_clinicas_registra_diagnostica');

        closeDiagnosisModal();
        loadAppointments();


    } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    }
}

// ---------------------------------------------------------

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
        hora: (document.getElementById('hora').value.split(':').length === 2)
            ? document.getElementById('hora').value + ':00'
            : document.getElementById('hora').value,
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

    const filtered = allAppointments.filter(apt => {
        const pacienteNombre = apt.paciente && apt.paciente.nombrePersona && apt.paciente.apellidoPersona
            ? `${apt.paciente.nombrePersona} ${apt.paciente.apellidoPersona}`.toLowerCase()
            : '';

        const medicoNombre = apt.medico && apt.medico.nombrePersona && apt.medico.apellidoPersona
            ? `${apt.medico.nombrePersona} ${apt.medico.apellidoPersona}`.toLowerCase()
            : '';

        const matchSearch = pacienteNombre.includes(search) ||
            medicoNombre.includes(search) ||
            apt.idcita.toString().includes(search);

        return matchSearch;
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