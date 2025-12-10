// pacientes.js - VERSIÓN CORREGIDA
const API_URL = 'http://localhost:8080'; // ✅ Puerto correcto Spring Boot

let currentPatient = null;
let allPatients = [];

document.addEventListener('DOMContentLoaded', () => {
    loadPatients();
});

// ========== CARGAR PACIENTES ==========
async function loadPatients() {
    try {
        const response = await fetch(`${API_URL}/api/pacientes`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar pacientes');
        }
        
        allPatients = await response.json();
        renderPatients(allPatients);
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al cargar los pacientes', 'error');
    }
}

// ========== RENDERIZAR TABLA ==========
function renderPatients(patients) {
    const tbody = document.getElementById('patientsBody');
    tbody.innerHTML = '';
    
    if (patients.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px;">
                    No hay pacientes registrados
                </td>
            </tr>
        `;
        return;
    }
    
    patients.forEach(patient => {
        const edad = calcularEdad(patient.fechanacimiento);
        const row = `
            <tr>
                <td>${patient.codpaciente}</td>
                <td>${patient.nombrepersona} ${patient.apellidopersona}</td>
                <td>${patient.tipodocumento} ${patient.numdocumento}</td>
                <td>${patient.dirpaciente}</td>
                <td>${patient.correo}</td>
                <td>${edad} años</td>
                <td>
                    <button class="btn-icon" onclick='editPatient(${JSON.stringify(patient).replace(/'/g, "&#39;")})' 
                            title="Editar">✏️</button>
                    <button class="btn-icon" onclick="deletePatient(${patient.codpaciente}, ${patient.numdocumento})" 
                            title="Eliminar">🗑️</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// ========== CALCULAR EDAD ==========
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

// ========== ABRIR MODAL ==========
function openModal(patient = null) {
    const modal = document.getElementById('patientModal');
    const form = document.getElementById('patientForm');
    const title = document.getElementById('modalTitle');
    
    if (patient) {
        title.textContent = 'Editar Paciente';
        currentPatient = patient;
        
        // Llenar formulario
        document.getElementById('numDocumento').value = patient.numdocumento;
        document.getElementById('numDocumento').disabled = true;
        document.getElementById('nombrePersona').value = patient.nombrepersona;
        document.getElementById('apellidoPersona').value = patient.apellidopersona;
        document.getElementById('tipoDocumento').value = patient.tipodocumento;
        document.getElementById('genero').value = patient.genero;
        document.getElementById('fechaNacimiento').value = patient.fechanacimiento;
        document.getElementById('correo').value = patient.correo;
        document.getElementById('dirPaciente').value = patient.dirpaciente;
    } else {
        title.textContent = 'Nuevo Paciente';
        currentPatient = null;
        form.reset();
        document.getElementById('numDocumento').disabled = false;
    }
    
    modal.style.display = 'block';
}

// ========== CERRAR MODAL ==========
function closeModal() {
    document.getElementById('patientModal').style.display = 'none';
    document.getElementById('patientForm').reset();
    currentPatient = null;
}

// ========== GUARDAR PACIENTE ==========
async function savePatient(event) {
    event.preventDefault();
    
    const esNuevo = !currentPatient; // Determinar si es INSERT o UPDATE


    // ✅ Estructura que coincide con el backend
    const patientData = {
        persona: {
            numDocumento: parseInt(document.getElementById('numDocumento').value),
            tipoDocumento: document.getElementById('tipoDocumento').value,
            nombrePersona: document.getElementById('nombrePersona').value.trim(),
            apellidoPersona: document.getElementById('apellidoPersona').value.trim(),
            genero: document.getElementById('genero').value,
            fechaNacimiento: document.getElementById('fechaNacimiento').value,
            correo: document.getElementById('correo').value.trim()
        },
        paciente: {
            dirPaciente: document.getElementById('dirPaciente').value.trim()
        }
    };
    
    try {
        const url = currentPatient 
            ? `${API_URL}/api/pacientes/${currentPatient.codpaciente}/${currentPatient.numdocumento}`
            : `${API_URL}/api/pacientes`;
        
        const method = currentPatient ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(patientData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.mensaje || 'Error al guardar');
        }
        
        const accion = esNuevo ? 'INSERT' : 'UPDATE';
        await registrarAuditoria(accion, 'pacientes');


        showNotification(
            currentPatient ? 'Paciente actualizado correctamente' : 'Paciente creado correctamente',
            'success'
        );
        
        closeModal();
        loadPatients();
    } catch (error) {
        console.error('Error:', error);
        showNotification(error.message || 'Error al guardar el paciente', 'error');
    }
}

// ========== EDITAR PACIENTE ==========
function editPatient(patient) {
    openModal(patient);
}

// ========== ELIMINAR PACIENTE ==========
async function deletePatient(codPaciente, numDocumento) {
    if (!confirm('¿Está seguro de eliminar este paciente?\n\nEsta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/pacientes/${codPaciente}/${numDocumento}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar');
        }

        await registrarAuditoria('DELETE', 'pacientes');

        
        showNotification('Paciente eliminado correctamente', 'success');
        loadPatients();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al eliminar el paciente', 'error');
    }
}

// ========== FILTRAR PACIENTES ==========
function filterPatients() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const sedeFilter = document.getElementById('filterSede').value;
    
    let filtered = allPatients.filter(patient => {
        const matchesSearch = 
            patient.nombrepersona.toLowerCase().includes(searchTerm) ||
            patient.apellidopersona.toLowerCase().includes(searchTerm) ||
            patient.numdocumento.toString().includes(searchTerm) ||
            patient.correo.toLowerCase().includes(searchTerm);
        
        const matchesSede = !sedeFilter || true;
        
        return matchesSearch && matchesSede;
    });
    
    renderPatients(filtered);
}

// ========== NOTIFICACIONES ==========
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// ========== CERRAR MODAL AL HACER CLIC FUERA ==========
window.onclick = function(event) {
    const modal = document.getElementById('patientModal');
    if (event.target === modal) {
        closeModal();
    }
}