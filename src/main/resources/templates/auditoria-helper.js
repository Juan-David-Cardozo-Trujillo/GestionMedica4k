/**
 * auditoria-helper.js
 * 
 * Funciones globales para registrar auditoría en todos los módulos
 * Incluir este archivo en todas las páginas HTML:
 * <script src="auditoria-helper.js"></script>
 */

const AUDITORIA_API_URL = 'http://localhost:8080/api/auditoria';

/**
 * Registra un evento de auditoría
 * @param {string} accion - Tipo de acción: SELECT, INSERT, UPDATE, DELETE
 * @param {string} tabla - Nombre de la tabla afectada
 * @param {string} ipOrigen - IP de origen (opcional, por defecto 'Web-Client')
 * @returns {Promise<boolean>} - true si se registró correctamente
 */
async function registrarAuditoria(accion, tabla, ipOrigen = 'Web-Client') {
    try {
        // Obtener usuario del localStorage
        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
        const idUsuario = usuario.idUsuario || null;
        
        // Validar parámetros
        if (!accion || !tabla) {
            console.warn('Auditoría: acción y tabla son obligatorios');
            return false;
        }
        
        // Validar que la acción sea válida
        const accionesValidas = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];
        if (!accionesValidas.includes(accion.toUpperCase())) {
            console.warn(`Auditoría: acción inválida "${accion}"`);
            return false;
        }
        
        // Hacer la petición al backend
        const response = await fetch(`${AUDITORIA_API_URL}/registrar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            },
            body: JSON.stringify({
                accion: accion.toUpperCase(),
                tabla: tabla,
                ipOrigen: ipOrigen,
                idUsuario: idUsuario
            })
        });
        
        if (!response.ok) {
            console.error('Error al registrar auditoría:', await response.text());
            return false;
        }
        
        const data = await response.json();
        console.log('✅ Auditoría registrada:', data);
        return true;
        
    } catch (error) {
        console.error('❌ Error al registrar auditoría:', error);
        return false;
    }
}

/**
 * Registra múltiples eventos de auditoría en batch
 * @param {Array<{accion: string, tabla: string}>} eventos - Array de eventos
 */
async function registrarAuditoriaBatch(eventos) {
    const promesas = eventos.map(evento => 
        registrarAuditoria(evento.accion, evento.tabla, evento.ipOrigen)
    );
    return Promise.all(promesas);
}

/**
 * Wrapper para operaciones CRUD con auditoría automática
 * @param {Function} operacion - Función async que realiza la operación
 * @param {string} accion - Acción de auditoría (INSERT, UPDATE, DELETE)
 * @param {string} tabla - Nombre de la tabla
 */
async function ejecutarConAuditoria(operacion, accion, tabla) {
    try {
        // Ejecutar la operación principal
        const resultado = await operacion();
        
        // Si fue exitosa, registrar auditoría
        if (resultado) {
            await registrarAuditoria(accion, tabla);
        }
        
        return resultado;
    } catch (error) {
        console.error('Error en operación:', error);
        throw error;
    }
}

// Exportar funciones globalmente
window.registrarAuditoria = registrarAuditoria;
window.registrarAuditoriaBatch = registrarAuditoriaBatch;
window.ejecutarConAuditoria = ejecutarConAuditoria;