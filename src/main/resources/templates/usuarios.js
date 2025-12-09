// usuarios.js
const API_URL = 'http://localhost:8080';
let currentUsuario = null;
let allUsuarios = [];

// Permisos por rol
const rolesPermisos = {
    Administrador: [
        'Gestión completa de sedes hospitalarias',
        'Gestión de pacientes',
        'Gestión de departamentos',
        'Gestión de empleados',
        'Gestión de reportes médicos',
        'Gestión de usuarios',
        'Gestión de personas',
        'Gestión de enfermedades',
        'Auditoría de accesos'
    ],
    Medico: [
        'Gestión de historias clínicas',
        'Registro de diagnósticos',
        'Prescripción de medicamentos',
        'Consulta de enfermedades',
        'Consulta de medicamentos'
    ],
    Secretaria: [
        'Gestión de pacientes',
        'Gestión de personas',
        'Gestión de citas',
        'Consulta de empleados',
        'Consulta de sedes'
    ],
    TecnicoMantenimiento: [
        'Consulta de equipamientos',
        'Consulta de uso de equipos por departamento'
    ],
    AsistenteBodega: [
        'Gestión completa de medicamentos',
        'Gestión completa de equipamientos',
        'Asignación de equipos a departamentos'
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    loadUsuarios();
    
    // Mostrar permisos al seleccionar rol
    document.getElementById('rol').addEventListener('change', mostrarPermisos);
});

// Cargar usuarios
async function loadUsuarios() {
    try {
        const response = await fetch(`${API_URL}/api/usuarios`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (!response.ok) throw new Error('Error al cargar usuarios');
        
        allUsuarios = await response.json();
        renderUsuarios(allUsuarios);
        updateStats();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al cargar usuarios', 'error');
    }
}

// Renderizar tabla
function renderUsuarios(usuarios) {
    const tbody = document.getElementById('usuariosBody');
    tbody.innerHTML = '';
    
    if (usuarios.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="7" style="text-align:center; padding:40px;">
                No hay usuarios registrados
            </td></tr>
        `;
        return;
    }
    
    usuarios.forEach(user => {
        const rolClass = user.rol.toLowerCase().replace(/\s/g, '');
        const estado = 'activo'; // Por defecto activo
        
        tbody.innerHTML += `
            <tr>
                <td>${user.idusuario}</td>
                <td>${user.nombreusuario}</td>
                <td>${user.persona?.nombrepersona || 'N/A'} ${user.persona?.apellidopersona || ''}</td>
                <td>${user.numdocumento}</td>
                <td><span class="role-badge role-${rolClass}">${user.rol}</span></td>
                <td><span class="status-badge status-${estado}">${estado.charAt(0).toUpperCase() + estado.slice(1)}</span></td>
                <td>
                    <button class="btn-icon" onclick='editUsuario(${JSON.stringify(user)})' title="Editar">✏️</button>
                    <button class="btn-icon" onclick="deleteUsuario(${user.idusuario})" title="Eliminar">🗑️</button>
                </td>
            </tr>
        `;
    });
}

// Actualizar estadísticas
function updateStats() {
    document.getElementById('totalUsuarios').textContent = allUsuarios.length;
    document.getElementById('totalAdmins').textContent = 
        allUsuarios.filter(u => u.rol === 'Administrador').length;
    document.getElementById('totalMedicos').textContent = 
        allUsuarios.filter(u => u.rol === 'Medico').length;
}

// Abrir modal
function openModal(usuario = null) {
    const modal = document.getElementById('usuarioModal');
    const form = document.getElementById('usuarioForm');
    const title = document.getElementById('modalTitle');
    
    if (usuario) {
        title.textContent = 'Editar Usuario';
        currentUsuario = usuario;
        
        // Llenar datos de persona
        document.getElementById('tipoDocumento').value = usuario.persona?.tipodocumento || '';
        document.getElementById('numDocumento').value = usuario.numdocumento;
        document.getElementById('numDocumento').disabled = true;
        document.getElementById('nombrePersona').value = usuario.persona?.nombrepersona || '';
        document.getElementById('apellidoPersona').value = usuario.persona?.apellidopersona || '';
        document.getElementById('genero').value = usuario.persona?.genero || '';
        document.getElementById('fechaNacimiento').value = usuario.persona?.fechanacimiento || '';
        document.getElementById('correo').value = usuario.persona?.correo || '';
        
        // Llenar datos de usuario
        document.getElementById('nombreUsuario').value = usuario.nombreusuario;
        document.getElementById('contrasena').value = '';
        document.getElementById('contrasena').placeholder = 'Dejar en blanco para mantener actual';
        document.getElementById('contrasena').required = false;
        document.getElementById('rol').value = usuario.rol;
        
        mostrarPermisos();
    } else {
        title.textContent = 'Nuevo Usuario';
        currentUsuario = null;
        form.reset();
        document.getElementById('numDocumento').disabled = false;
        document.getElementById('contrasena').required = true;
        document.getElementById('contrasena').placeholder = 'Mínimo 6 caracteres';
        document.getElementById('permissionsInfo').style.display = 'none';
    }
    
    modal.style.display = 'block';
}

// Cerrar modal
function closeModal() {
    document.getElementById('usuarioModal').style.display = 'none';
    document.getElementById('usuarioForm').reset();
    currentUsuario = null;
}

// Mostrar permisos según rol
function mostrarPermisos() {
    const rol = document.getElementById('rol').value;
    const permissionsInfo = document.getElementById('permissionsInfo');
    
    if (!rol) {
        permissionsInfo.style.display = 'none';
        return;
    }
    
    const permisos = rolesPermisos[rol] || [];
    
    permissionsInfo.innerHTML = `
        <h4>Permisos de ${rol}:</h4>
        <ul>
            ${permisos.map(p => `<li>${p}</li>`).join('')}
        </ul>
    `;
    permissionsInfo.style.display = 'block';
}

// Guardar usuario
async function saveUsuario(event) {
    event.preventDefault();
    
    const contrasena = document.getElementById('contrasena').value;
    
    // Validaciones
    if (!currentUsuario && contrasena.length < 6) {
        showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    const data = {
        persona: {
            numDocumento: parseInt(document.getElementById('numDocumento').value),
            tipoDocumento: document.getElementById('tipoDocumento').value,
            nombrePersona: document.getElementById('nombrePersona').value.trim(),
            apellidoPersona: document.getElementById('apellidoPersona').value.trim(),
            genero: document.getElementById('genero').value,
            fechaNacimiento: document.getElementById('fechaNacimiento').value,
            correo: document.getElementById('correo').value.trim()
        },
        usuario: {
            nombreUsuario: document.getElementById('nombreUsuario').value.trim(),
            rol: document.getElementById('rol').value,
            numDocumento: parseInt(document.getElementById('numDocumento').value)
        }
    };
    
    // Solo incluir contraseña si se proporcionó
    if (contrasena) {
        data.usuario.contrasenaEncriptada = contrasena;
    }
    
    try {
        const url = currentUsuario 
            ? `${API_URL}/api/usuarios/${currentUsuario.idusuario}`
            : `${API_URL}/api/usuarios`;
        
        const method = currentUsuario ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al guardar');
        }
        
        showNotification(
            currentUsuario ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente',
            'success'
        );
        
        closeModal();
        loadUsuarios();
    } catch (error) {
        console.error('Error:', error);
        showNotification(error.message || 'Error al guardar usuario', 'error');
    }
}

// Editar usuario
function editUsuario(usuario) {
    openModal(usuario);
}

// Eliminar usuario
async function deleteUsuario(idUsuario) {
    if (!confirm('¿Está seguro de eliminar este usuario?\n\nEsta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/usuarios/${idUsuario}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (!response.ok) throw new Error('Error al eliminar');
        
        showNotification('Usuario eliminado correctamente', 'success');
        loadUsuarios();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al eliminar usuario', 'error');
    }
}

// Filtrar usuarios
function filterUsuarios() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const rolFilter = document.getElementById('filterRol').value;
    
    const filtered = allUsuarios.filter(user => {
        const matchSearch = 
            user.nombreusuario.toLowerCase().includes(search) ||
            (user.persona?.nombrepersona || '').toLowerCase().includes(search) ||
            (user.persona?.apellidopersona || '').toLowerCase().includes(search) ||
            user.numdocumento.toString().includes(search);
        
        const matchRol = !rolFilter || user.rol === rolFilter;
        
        return matchSearch && matchRol;
    });
    
    renderUsuarios(filtered);
}

// Notificaciones
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} show`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}