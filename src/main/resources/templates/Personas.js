const API_URL = 'http://localhost:8080/api';
let currentPersona = null;
let allPersonas = [];

document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación
    if (!requireAuth()) return;

    // Mostrar información de sede en consola
    console.log('👤 Usuario logueado - Sede:', getSedeId());

    loadPersonas();
});

// ✅ ACTUALIZADO: Usar fetchWithSede
async function loadPersonas() {
    try {
        const response = await fetchWithSede(`${API_URL}/personas`);

        if (!response.ok) throw new Error('Error al cargar');

        allPersonas = await response.json();
        renderPersonas(allPersonas);
        updateStats();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al cargar personas', 'error');
    }
}

function renderPersonas(personas) {
    const tbody = document.getElementById('personasBody');
    tbody.innerHTML = '';

    if (personas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:40px;">
            No hay personas registradas</td></tr>`;
        return;
    }

    personas.forEach(p => {
        const edad = calcularEdad(p.fechaNacimiento);
        const fechaMostrar = p.fechaNacimiento ? p.fechaNacimiento.split('T')[0] : 'N/A';

        tbody.innerHTML += `
            <tr>
                <td>${p.numDocumento}</td>
                <td>${p.tipoDocumento}</td>
                <td>${p.nombrePersona} ${p.apellidoPersona}</td>
                <td>${p.genero === 'M' ? 'Masculino' : 'Femenino'}</td>
                <td>${fechaMostrar}</td>
                <td>${edad} años</td>
                <td>${p.correo}</td>
                <td>
                    <button class="btn-icon" onclick='editPersona(${JSON.stringify(p)})'>✏️</button>
                    <button class="btn-icon" onclick="deletePersona(${p.numDocumento})">🗑️</button>
                </td>
            </tr>
        `;
    });
}

function calcularEdad(fechaString) {
    if (!fechaString) return 0;
    const hoy = new Date();
    const nacimiento = new Date(fechaString);
    nacimiento.setMinutes(nacimiento.getMinutes() + nacimiento.getTimezoneOffset());

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
}

function updateStats() {
    document.getElementById('totalPersonas').textContent = allPersonas.length;
    document.getElementById('totalMasculino').textContent =
        allPersonas.filter(p => p.genero === 'M').length;
    document.getElementById('totalFemenino').textContent =
        allPersonas.filter(p => p.genero === 'F').length;
}

function openModal(persona = null) {
    const modal = document.getElementById('personaModal');
    const form = document.getElementById('personaForm');

    if (persona) {
        document.getElementById('modalTitle').textContent = 'Editar Persona';
        currentPersona = persona;

        document.getElementById('tipoDocumento').value = persona.tipoDocumento;
        document.getElementById('numDocumento').value = persona.numDocumento;
        document.getElementById('numDocumento').disabled = true;

        document.getElementById('nombrePersona').value = persona.nombrePersona;
        document.getElementById('apellidoPersona').value = persona.apellidoPersona;
        document.getElementById('genero').value = persona.genero;
        document.getElementById('fechaNacimiento').value = persona.fechaNacimiento;
        document.getElementById('correo').value = persona.correo;
    } else {
        document.getElementById('modalTitle').textContent = 'Nueva Persona';
        currentPersona = null;
        form.reset();
        document.getElementById('numDocumento').disabled = false;
    }

    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('personaModal').style.display = 'none';
}

// ✅ ACTUALIZADO: Usar fetchWithSede
async function savePersona(event) {
    event.preventDefault();

    const esNuevo = !currentPersona;

    const data = {
        numDocumento: parseInt(document.getElementById('numDocumento').value),
        tipoDocumento: document.getElementById('tipoDocumento').value,
        nombrePersona: document.getElementById('nombrePersona').value.trim(),
        apellidoPersona: document.getElementById('apellidoPersona').value.trim(),
        genero: document.getElementById('genero').value,
        fechaNacimiento: document.getElementById('fechaNacimiento').value,
        correo: document.getElementById('correo').value.trim()
    };

    try {
        const url = currentPersona
            ? `${API_URL}/personas/${currentPersona.numDocumento}`
            : `${API_URL}/personas`;

        const method = currentPersona ? 'PUT' : 'POST';

        // ✅ fetchWithSede incluye X-Sede-Id automáticamente
        const response = await fetchWithSede(url, {
            method: method,
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        const accion = esNuevo ? 'INSERT' : 'UPDATE';
        await registrarAuditoria(accion, 'personas');

        showNotification('Persona guardada correctamente', 'success');
        closeModal();
        loadPersonas();
    } catch (error) {
        console.error(error);
        showNotification('Error: ' + error.message, 'error');
    }
}

function editPersona(persona) {
    openModal(persona);
}

// ✅ ACTUALIZADO: Usar fetchWithSede
async function deletePersona(numDocumento) {
    if (!confirm('¿Eliminar esta persona?')) return;

    try {
        const response = await fetchWithSede(`${API_URL}/personas/${numDocumento}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorMsg = await response.text();
            throw new Error(errorMsg);
        }

        await registrarAuditoria('DELETE', 'personas');

        showNotification('Persona eliminada', 'success');
        loadPersonas();
    } catch (error) {
        console.error(error);
        showNotification(error.message, 'error');
    }
}

function filterPersonas() {
    const search = document.getElementById('searchInput').value.toLowerCase();

    const filtered = allPersonas.filter(p => {
        const nombre = p.nombrePersona ? p.nombrePersona.toLowerCase() : '';
        const apellido = p.apellidoPersona ? p.apellidoPersona.toLowerCase() : '';
        const correo = p.correo ? p.correo.toLowerCase() : '';
        const numDoc = p.numDocumento ? p.numDocumento.toString() : '';

        const matchSearch =
            nombre.includes(search) ||
            apellido.includes(search) ||
            numDoc.includes(search) ||
            correo.includes(search);

        return matchSearch;
    });

    renderPersonas(filtered);
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} show`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}