// pacientes.js
const API_URL = 'http://localhost:3000/api';
let currentPatient = null;
let allPatients = [];

// Cargar pacientes al iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadPatients();
});

// Obtener todos los pacientes
async function loadPatients() {
    try {
        const response = await fetch(`${API_URL}/pacientes`, {
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

// Renderizar tabla de pacientes
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
                    <button class="btn-icon" onclick='editPatient(${JSON.stringify(patient)})' 
                            title="Editar">✏️</button>
                    <button class="btn-icon" onclick="deletePatient(${patient.codpaciente}, ${patient.numdocumento})" 
                            title="Eliminar">🗑️</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// Calcular edad
function calcularEdad(fechaNacimiento) {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    
    return edad;
}

// Abrir modal
function openModal(patient = null) {
    const modal = document.getElementById('patientModal');
    const form = document.getElementById('patientForm');
    const title = document.getElementById('modalTitle');
    
    if (patient) {
        title.textContent = 'Editar Paciente';
        currentPatient = patient;
        
        // Llenar formulario con datos existentes
        document.getElementById('numDocumento').value = patient.numdocumento;
        document.getElementById('numDocumento').disabled = true; // No editable
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

// Cerrar modal
function closeModal() {
    document.getElementById('patientModal').style.display = 'none';
    document.getElementById('patientForm').reset();
    currentPatient = null;
}

// Guardar paciente
async function savePatient(event) {
    event.preventDefault();
    
    const patientData = {
        persona: {
            numDocumento: parseInt(document.getElementById('numDocumento').value),
            nombrePersona: document.getElementById('nombrePersona').value.trim(),
            apellidoPersona: document.getElementById('apellidoPersona').value.trim(),
            tipoDocumento: document.getElementById('tipoDocumento').value,
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
            ? `${API_URL}/pacientes/${currentPatient.codpaciente}`
            : `${API_URL}/pacientes`;
        
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
            throw new Error(error.message || 'Error al guardar');
        }
        
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

// Editar paciente
function editPatient(patient) {
    openModal(patient);
}

// Eliminar paciente
async function deletePatient(codPaciente, numDocumento) {
    if (!confirm('¿Está seguro de eliminar este paciente?\n\nEsta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/pacientes/${codPaciente}?numDocumento=${numDocumento}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar');
        }
        
        showNotification('Paciente eliminado correctamente', 'success');
        loadPatients();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al eliminar el paciente', 'error');
    }
}

// Filtrar pacientes
function filterPatients() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const sedeFilter = document.getElementById('filterSede').value;
    
    let filtered = allPatients.filter(patient => {
        const matchesSearch = 
            patient.nombrepersona.toLowerCase().includes(searchTerm) ||
            patient.apellidopersona.toLowerCase().includes(searchTerm) ||
            patient.numdocumento.toString().includes(searchTerm) ||
            patient.correo.toLowerCase().includes(searchTerm);
        
        // Si hay filtro de sede, aplicarlo (requiere endpoint adicional)
        const matchesSede = !sedeFilter || true; // Implementar según tu lógica
        
        return matchesSearch && matchesSede;
    });
    
    renderPatients(filtered);
}

// Mostrar notificaciones
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Mostrar notificación
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Ocultar y eliminar después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('patientModal');
    if (event.target === modal) {
        closeModal();
    }
}