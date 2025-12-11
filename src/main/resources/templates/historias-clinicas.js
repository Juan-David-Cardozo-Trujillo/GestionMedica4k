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
        await registrarAuditoria('SELECT', 'historias_clinicas');
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
        // populatePacienteSelect(); // Eliminado porque la creación ahora es automática
        // populatePacienteFilter(); // Eliminado       // populatePacienteFilter(); // Eliminado
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
/* 
// Función obsoleta - La creación es automática
function populatePacienteSelect() {
    const select = document.getElementById('codPaciente');
    if(!select) return;
    
    select.innerHTML = '<option value="">Seleccione un paciente</option>';

    console.log('Pacientes cargados:', pacientes); // Debug

    // Filtrar pacientes que NO tienen historia clínica
    const pacientesSinHistoria = pacientes.filter(p => {
        const codPaciente = p.codpaciente;
        return !allHistorias.some(h => h.codPaciente === codPaciente);
    });

    if (pacientesSinHistoria.length === 0) {
        select.innerHTML = '<option value="">Todos los pacientes ya tienen historia clínica</option>';
        return;
    }

    pacientesSinHistoria.forEach(p => {
        // El API devuelve nombrePersona y apellidoPersona directamente en el objeto paciente
        const nombre = p.nombrePersona && p.apellidoPersona ?
            `${p.nombrePersona} ${p.apellidoPersona}` : 'Sin nombre';
        const numDoc = p.numdocumento || 'N/A';
        const codPaciente = p.codpaciente;

        select.innerHTML += `
            <option value="${codPaciente}" data-numdocumento="${numDoc}">
                ${nombre} - Doc: ${numDoc}
            </option>
        `;
    });
}
*/

// Poblar filtro de pacientes
function populatePacienteFilter() {
    const select = document.getElementById('filterPaciente');
    select.innerHTML = '<option value="">Todos los pacientes</option>';
    pacientes.forEach(p => {
        const nombre = p.nombrePersona && p.apellidoPersona ?
            `${p.nombrePersona} ${p.apellidoPersona}` : 'Sin nombre';
        const codPaciente = p.codpaciente;
        select.innerHTML += `
            <option value="${codPaciente}">
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
        const nombre = paciente.nombrePersona && paciente.apellidoPersona ?
            `${paciente.nombrePersona} ${paciente.apellidoPersona}` : 'N/A';
        const edad = calcularEdad(paciente.fechaNacimiento);
        // Como no hay campo fechaCreacion en el modelo, mostramos fecha actual
        const fecha = 'Reciente';
        const codHistoria = historia.codHistoria || 'N/A';

        tbody.innerHTML += `
            <tr onclick="showDetails(${codHistoria})" style="cursor: pointer;">
                <td>${codHistoria}</td>
                <td>${nombre}</td>
                <td>${paciente.numDocumento || historia.numDocumento || 'N/A'}</td>
                <td>${edad || 'N/A'}</td>
                <td>${fecha}</td>
                <td onclick="event.stopPropagation();">
                    <button class="btn-icon" onclick="showDetails(${codHistoria})" title="Ver">👁️</button>
                    <button class="btn-icon" onclick="deleteHistoria(${codHistoria})" title="Eliminar">🗑️</button>
                </td>
            </tr>
        `;
    });
}

// Calcular edad
// Calcular edad
// Calcular edad
function calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return 'N/A';

    let anio, mesNac, dia;

    // Si viene como array [YYYY, MM, DD] (común en Java LocalDate default JSON)
    if (Array.isArray(fechaNacimiento)) {
        anio = fechaNacimiento[0];
        mesNac = fechaNacimiento[1] - 1;
        dia = fechaNacimiento[2];
    }
    // Si viene como string "YYYY-MM-DD"
    else if (typeof fechaNacimiento === 'string') {
        const parts = fechaNacimiento.split('-');
        if (parts.length === 3) {
            anio = parseInt(parts[0], 10);
            mesNac = parseInt(parts[1], 10) - 1;
            dia = parseInt(parts[2], 10);
        } else {
            // Intento final con Date standard parsing
            const date = new Date(fechaNacimiento);
            if (!isNaN(date.getTime())) {
                anio = date.getFullYear();
                mesNac = date.getMonth();
                dia = date.getDate();
            } else {
                return 'N/A';
            }
        }
    } else {
        return 'N/A';
    }

    const hoy = new Date();
    let edad = hoy.getFullYear() - anio;
    const mesActual = hoy.getMonth();

    if (mesActual < mesNac || (mesActual === mesNac && hoy.getDate() < dia)) {
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
    const codPaciente = parseInt(select.value);
    const observaciones = document.getElementById('observaciones').value;

    if (!codPaciente) {
        showNotification('Por favor seleccione un paciente', 'error');
        return;
    }

    // Verificar si el paciente ya tiene una historia clínica
    const historiaExistente = allHistorias.find(h => h.codPaciente === codPaciente);
    if (historiaExistente) {
        showNotification('Este paciente ya tiene una historia clínica registrada', 'error');
        return;
    }

    // Buscar el paciente para obtener el numDocumento
    const paciente = pacientes.find(p => p.codpaciente === codPaciente);
    if (!paciente || !paciente.numdocumento) {
        console.error('Paciente encontrado:', paciente);
        showNotification('No se pudo obtener el documento del paciente', 'error');
        return;
    }

    const data = {
        codPaciente: codPaciente,
        numDocumento: paciente.numdocumento,
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

        console.log('Response status:', response.status);
        const result = await response.text();
        console.log('Response:', result);

        if (!response.ok) {
            throw new Error('Error al guardar: ' + result);
        }

        await registrarAuditoria('INSERT', 'historias_clinicas');

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
        await registrarAuditoria('SELECT', 'historias_clinicas');

        const paciente = historia.paciente || {};
        const nombre = paciente.nombrePersona ? `${paciente.nombrePersona} ${paciente.apellidoPersona}` : 'N/A';
        const edad = calcularEdad(paciente.fechaNacimiento);

        document.getElementById('historiaDetalles').innerHTML = `
            <div class="detail-row">
                <strong>Código Historia:</strong> <span>${historia.codHistoria}</span>
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
                <strong>Código Paciente:</strong> <span>${historia.codPaciente}</span>
            </div>
        `;

        // Cargar diagnósticos
        renderDiagnosticos(historia.diagnosticos || []);

        // Cargar medicamentos
        renderMedicamentos(historia.medicamentos || []);

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
        const fecha = diag.fechaRegistro ?
            new Date(diag.fechaRegistro).toLocaleDateString('es-ES') : 'N/A';
        const hora = diag.horaRegistro || 'N/A';

        container.innerHTML += `
            <div class="diagnostico-item">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong>🔬 ${nombreEnfermedad}</strong>
                    <button class="btn-icon" onclick="deleteDiagnostico(${diag.codHistoria}, ${diag.idEnfermedad}, ${diag.idCita})" title="Eliminar">🗑️</button>
                </div>
                <p><strong>Fecha:</strong> ${fecha} ${hora}</p>
                <p><strong>Cita ID:</strong> ${diag.idCita}</p>
            </div>
        `;
    });
}

// Renderizar medicamentos
function renderMedicamentos(medicamentos) {
    const container = document.getElementById('medicamentosList');

    if (!medicamentos || medicamentos.length === 0) {
        container.innerHTML = '<p style="color:#999; text-align:center;">No hay medicamentos prescritos</p>';
        return;
    }

    container.innerHTML = '';
    medicamentos.forEach(med => {
        const nombre = med.nombreMedicamento || 'Medicamento desconocido';
        const desc = med.descripcionMedicamento || '';
        const fecha = med.fechaCita ?
            new Date(med.fechaCita).toLocaleDateString('es-ES') : 'N/A';

        container.innerHTML += `
            <div class="diagnostico-item" style="border-left: 4px solid #4CAF50;"> <!-- Diferente color para meds -->
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong>💊 ${nombre}</strong>
                    <!-- <button class="btn-icon" onclick="deleteMedicamento(...)" title="Eliminar">🗑️</button> opcional -->
                </div>
                <p><strong>Descripción:</strong> ${desc}</p>
                <p><strong>Fecha Prescripción:</strong> ${fecha}</p>
                <p><strong>Cita ID:</strong> ${med.idCita}</p>
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
async function openDiagnosticoModal() {
    // Cargar enfermedades
    const selectEnfermedad = document.getElementById('idEnfermedad');
    selectEnfermedad.innerHTML = '<option value="">Seleccione enfermedad</option>';
    enfermedades.forEach(e => {
        // Acepta tanto idEnfermedad/nombreEnfermedad como idenfermedad/nombreenfermedad
        const id = e.idEnfermedad || e.idenfermedad;
        const nombre = e.nombreEnfermedad || e.nombreenfermedad || 'Sin nombre';
        selectEnfermedad.innerHTML += `
            <option value="${id}">${nombre}</option>
        `;
    });

    // Cargar citas del paciente
    try {
        const response = await fetch(`${API_URL}/citas`);
        const todasLasCitas = await response.json();

        // Filtrar citas del paciente actual
        const citasPaciente = todasLasCitas.filter(cita =>
            cita.paciente &&
            cita.paciente.codpaciente === currentHistoria.codPaciente
        );

        const selectCita = document.getElementById('idCita');
        selectCita.innerHTML = '<option value="">Seleccione una cita</option>';
        citasPaciente.forEach(cita => {
            const fecha = cita.fecha || 'Sin fecha';
            const tipo = cita.tiposervicio || 'Consulta';
            selectCita.innerHTML += `
                <option value="${cita.idcita}">${tipo} - ${fecha}</option>
            `;
        });

        if (citasPaciente.length === 0) {
            showNotification('Este paciente no tiene citas registradas', 'warning');
        }
    } catch (error) {
        console.error('Error al cargar citas:', error);
    }

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

    const idEnfermedad = parseInt(document.getElementById('idEnfermedad').value);
    const idCita = parseInt(document.getElementById('idCita').value);

    if (!idEnfermedad || !idCita) {
        showNotification('Por favor complete todos los campos', 'error');
        return;
    }

    const data = {
        idEnfermedad: idEnfermedad,
        idCita: idCita,
        fechaRegistro: new Date().toISOString().split('T')[0],
        horaRegistro: new Date().toTimeString().split(' ')[0].substring(0, 8)
    };

    try {
        const response = await fetch(`${API_URL}/historias-clinicas/${currentHistoria.codHistoria}/diagnosticos`, {
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
        // Recargar los detalles de la historia
        await showDetails(currentHistoria.codHistoria);
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

        await registrarAuditoria('DELETE', 'historias_clinicas');

        showNotification('Historia eliminada', 'success');
        loadHistorias();
    } catch (error) {
        showNotification('Error al eliminar', 'error');
    }
}

// Eliminar diagnóstico
async function deleteDiagnostico(codHistoria, idEnfermedad, idCita) {
    if (!confirm('¿Eliminar este diagnóstico?')) return;

    try {
        const response = await fetch(`${API_URL}/historias-clinicas/${codHistoria}/diagnosticos/${idEnfermedad}/${idCita}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (!response.ok) throw new Error('Error al eliminar diagnóstico');

        await registrarAuditoria('DELETE', 'historias_clinicas_registra_diagnostica');

        showNotification('Diagnóstico eliminado correctamente', 'success');
        // Recargar los detalles de la historia
        await showDetails(codHistoria);
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al eliminar diagnóstico', 'error');
    }
}

// Filtrar historias
function filterHistorias() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const paciente = document.getElementById('filterPaciente').value;

    const filtered = allHistorias.filter(h => {
        const pacienteData = h.paciente || {};
        const nombre = pacienteData.nombrePersona && pacienteData.apellidoPersona ?
            `${pacienteData.nombrePersona} ${pacienteData.apellidoPersona}` : '';

        const matchSearch = h.codHistoria.toString().includes(search) ||
            nombre.toLowerCase().includes(search) ||
            (pacienteData.numDocumento ? pacienteData.numDocumento.toString().includes(search) : false);

        // const matchPaciente = !paciente || (h.codPaciente && h.codPaciente.toString() === paciente);

        return matchSearch; // && matchPaciente;
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
// La función registrarAuditoria se importa desde auditoria-helper.js