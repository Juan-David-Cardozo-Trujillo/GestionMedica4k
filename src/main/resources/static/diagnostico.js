const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    loadMyCitas();
    loadEnfermedades();
});

async function loadMyCitas() {
    try {
        const userId = localStorage.getItem('userId');
        const response = await fetch(`${API_URL}/citas/medico/${userId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const citas = await response.json();
        
        const select = document.getElementById('idCita');
        select.innerHTML = '<option value="">Seleccione una cita</option>';
        citas.filter(c => c.estado === 'Tomada').forEach(c => {
            select.innerHTML += `
                <option value="${c.idcita}">
                    ${c.paciente_nombre} - ${new Date(c.fecha).toLocaleDateString()} ${c.hora}
                </option>
            `;
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function loadEnfermedades() {
    try {
        const response = await fetch(`${API_URL}/enfermedades`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const enfermedades = await response.json();
        
        const select = document.getElementById('idEnfermedad');
        select.innerHTML = '<option value="">Seleccione una enfermedad</option>';
        enfermedades.forEach(e => {
            select.innerHTML += `
                <option value="${e.idenfermedad}">${e.nombreenfermedad}</option>
            `;
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function saveDiagnostic(event) {
    event.preventDefault();
    
    const data = {
        idCita: parseInt(document.getElementById('idCita').value),
        idEnfermedad: parseInt(document.getElementById('idEnfermedad').value)
    };
    
    try {
        const response = await fetch(`${API_URL}/citas/${data.idCita}/diagnostico`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Error');
        alert('Diagnóstico registrado correctamente');
        document.getElementById('diagnosticForm').reset();
    } catch (error) {
        alert('Error al registrar diagnóstico');
    }
}