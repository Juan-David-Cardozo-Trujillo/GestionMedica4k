// usuarios.js - VERSIÓN CORREGIDA
const API_URL = 'http://localhost:8080'; // ✅ Puerto correcto Spring Boot
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
    const rolSelect = document.getElementById('rol');
    if (rolSelect) {
        rolSelect.addEventListener('change', mostrarPermisos);
    }
});

// ========== CARGAR USUARIOS ==========
async function loadUsuarios() {
    try {
        const response = await fetch(`${API_URL}/api/usuarios`, {
            headers: { 
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
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

// ========== RENDERIZAR TABLA ==========
function renderUsuarios(usuarios) {
    const tbody = document.getElementById('usuariosBody');
    if (!tbody) return;
    
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
        const nombreCompleto = user.persona 
            ? `${user.persona.nombrePersona || ''} ${user.persona.apellidoPersona || ''}`.trim()
            : 'N/A';
        const numDocumento = user.persona?.numDocumento || 'N/A';
        
        tbody.innerHTML += `
            <tr>
                <td>${user.idUsuario}</td>
                <td>${user.nombreUsuario}</td>
                <td>${nombreCompleto}</td>
                <td>${numDocumento}</td>
                <td><span class="role-badge role-${rolClass}">${user.rol}</span></td>
                <td><span class="status-badge status-activo">Activo</span></td>
                <td>
                    <button class="btn-icon" onclick='editUsuario(${JSON.stringify(user).replace(/'/g, "&#39;")})' 
                            title="Editar">✏️</button>
                    <button class="btn-icon" onclick="deleteUsuario(${user.idUsuario})" 
                            title="Eliminar">🗑️</button>
                </td>
            </tr>
        `;
    });
}

// ========== ACTUALIZAR ESTADÍSTICAS ==========
function updateStats() {
    const totalElement = document.getElementById('totalUsuarios');
    const adminsElement = document.getElementById('totalAdmins');
    const medicosElement = document.getElementById('totalMedicos');
    
    if (totalElement) totalElement.textContent = allUsuarios.length;
    if (adminsElement) {
        adminsElement.textContent = allUsuarios.filter(u => u.rol === 'Administrador').length;
    }
    if (medicosElement) {
        medicosElement.textContent = allUsuarios.filter(u => u.rol === 'Medico').length;
    }
}

// ========== ABRIR MODAL ==========
function openModal(usuario = null) {
    const modal = document.getElementById('usuarioModal');
    const form = document.getElementById('usuarioForm');
    const title = document.getElementById('modalTitle');
    
    if (usuario) {
        title.textContent = 'Editar Usuario';
        currentUsuario = usuario;
        
        // Llenar datos de persona
        document.getElementById('tipoDocumento').value = usuario.persona?.tipoDocumento || '';
        document.getElementById('numDocumento').value = usuario.persona?.numDocumento || '';
        document.getElementById('numDocumento').disabled = true;
        document.getElementById('nombrePersona').value = usuario.persona?.nombrePersona || '';
        document.getElementById('apellidoPersona').value = usuario.persona?.apellidoPersona || '';
        document.getElementById('genero').value = usuario.persona?.genero || '';
        document.getElementById('fechaNacimiento').value = usuario.persona?.fechaNacimiento || '';
        document.getElementById('correo').value = usuario.persona?.correo || '';
        
        // Llenar datos de usuario
        document.getElementById('nombreUsuario').value = usuario.nombreUsuario;
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
        const permissionsInfo = document.getElementById('permissionsInfo');
        if (permissionsInfo) permissionsInfo.style.display = 'none';
    }
    
    modal.style.display = 'block';
}

// ========== CERRAR MODAL ==========
function closeModal() {
    const modal = document.getElementById('usuarioModal');
    const form = document.getElementById('usuarioForm');
    
    if (modal) modal.style.display = 'none';
    if (form) form.reset();
    
    currentUsuario = null;
}

// ========== MOSTRAR PERMISOS ==========
function mostrarPermisos() {
    const rol = document.getElementById('rol').value;
    const permissionsInfo = document.getElementById('permissionsInfo');
    
    if (!permissionsInfo) return;
    
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

// ========== GUARDAR USUARIO ==========
async function saveUsuario(event) {
    event.preventDefault();
    
    const contrasena = document.getElementById('contrasena').value;
    
    // Validaciones
    if (!currentUsuario && contrasena.length < 6) {
        showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    // ✅ Estructura que coincide EXACTAMENTE con el backend
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
            rol: document.getElementById('rol').value
        }
    };
    
    // Solo incluir contraseña si se proporcionó
    if (contrasena) {
        data.usuario.contrasenaEncriptada = contrasena;
    }
    
    try {
        const url = currentUsuario 
            ? `${API_URL}/api/usuarios/${currentUsuario.idUsuario}`
            : `${API_URL}/api/usuarios/crear`;
        
        const method = currentUsuario ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.mensaje || 'Error al guardar');
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

// ========== EDITAR USUARIO ==========
function editUsuario(usuario) {
    openModal(usuario);
}

// ========== ELIMINAR USUARIO ==========
async function deleteUsuario(idUsuario) {
    if (!confirm('¿Está seguro de eliminar este usuario?\n\nEsta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/usuarios/${idUsuario}`, {
            method: 'DELETE',
            headers: { 
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Error al eliminar');
        
        showNotification('Usuario eliminado correctamente', 'success');
        loadUsuarios();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al eliminar usuario', 'error');
    }
}

// ========== FILTRAR USUARIOS ==========
function filterUsuarios() {
    const searchInput = document.getElementById('searchInput');
    const rolFilter = document.getElementById('filterRol');
    
    if (!searchInput || !rolFilter) return;
    
    const search = searchInput.value.toLowerCase();
    const rol = rolFilter.value;
    
    const filtered = allUsuarios.filter(user => {
        const matchSearch = 
            user.nombreUsuario.toLowerCase().includes(search) ||
            (user.persona?.nombrePersona || '').toLowerCase().includes(search) ||
            (user.persona?.apellidoPersona || '').toLowerCase().includes(search) ||
            (user.persona?.numDocumento || '').toString().includes(search);
        
        const matchRol = !rol || user.rol === rol;
        
        return matchSearch && matchRol;
    });
    
    renderUsuarios(filtered);
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
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ========== CERRAR MODAL AL HACER CLIC FUERA ==========
window.onclick = function(event) {
    const modal = document.getElementById('usuarioModal');
    if (event.target === modal) {
        closeModal();
    }
}