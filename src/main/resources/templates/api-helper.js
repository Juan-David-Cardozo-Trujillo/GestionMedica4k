function getSedeId() {
    const idSede = localStorage.getItem('idSede');
    if (!idSede) {
        console.warn('⚠️ No se encontró idSede en localStorage, usando Sede 1 por defecto');
        return '1';
    }
    return idSede;
}

/**
 * Obtiene el token de autenticación
 */
function getAuthToken() {
    return localStorage.getItem('token') || '';
}

/**
 * Crea headers con autenticación y sede automáticamente
 */
function getAuthHeaders() {
    const headers = {
        'Content-Type': 'application/json',
        'X-Sede-Id': getSedeId() // 👈 CLAVE: Header que lee el interceptor
    };

    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
}

/**
 * Wrapper de fetch que incluye sede automáticamente
 * USO: fetchWithSede(url, options)
 */
async function fetchWithSede(url, options = {}) {
    const defaultOptions = {
        headers: getAuthHeaders()
    };

    // Merge de opciones
    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...(options.headers || {})
        }
    };

    console.log('🌐 Fetch a:', url, 'con Sede:', getSedeId());

    return fetch(url, finalOptions);
}

/**
 * Verifica si el usuario está logueado
 */
function isUserLoggedIn() {
    return localStorage.getItem('usuario') !== null;
}

/**
 * Obtiene información del usuario logueado
 */
function getCurrentUser() {
    const userStr = localStorage.getItem('usuario');
    if (!userStr) return null;

    try {
        return JSON.parse(userStr);
    } catch (e) {
        console.error('Error parsing user data:', e);
        return null;
    }
}

/**
 * Redirecciona al login si no está autenticado
 */
function requireAuth() {
    if (!isUserLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

console.log('✅ api-helper.js cargado - Sede:', getSedeId());

async function registrarAuditoria(accion, tabla) {
    try {
        const usuario = getCurrentUser();

        const datos = {
            accion: accion,
            tabla: tabla,
            ipOrigen: 'Web',
            idUsuario: usuario ? usuario.idUsuario : null
        };

        const response = await fetchWithSede('http://localhost:8080/api/auditoria/registrar', {
            method: 'POST',
            body: JSON.stringify(datos)
        });

        if (response.ok) {
            console.log('✅ Auditoría registrada:', accion, tabla);
        } else {
            console.error('❌ Error registrando auditoría');
        }
    } catch (error) {
        console.error('Error en auditoría:', error);
    }
}