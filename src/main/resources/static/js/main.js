// src/main/resources/static/js/main.js

/**
 * Sistema HIS+ - JavaScript Principal
 * Funciones comunes para toda la aplicación
 */

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    console.log('HIS+ Sistema cargado correctamente');
    
    // Inicializar funciones comunes
    initConfirmations();
    initAlerts();
    initTableSearch();
    initDateValidations();
    highlightActiveMenu();
});

/**
 * Confirmaciones de eliminación
 */
function initConfirmations() {
    const deleteLinks = document.querySelectorAll('a[onclick*="confirm"]');
    deleteLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (!confirm('¿Está seguro de que desea eliminar este registro?')) {
                e.preventDefault();
                return false;
            }
        });
    });
}

/**
 * Auto-ocultar alertas después de 5 segundos
 */
function initAlerts() {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.transition = 'opacity 0.5s';
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 500);
        }, 5000);
    });
}

/**
 * Búsqueda en tablas
 */
function initTableSearch() {
    // Crear input de búsqueda si hay tablas
    const tables = document.querySelectorAll('table');
    tables.forEach((table, index) => {
        const container = table.parentElement;
        
        // Verificar si ya existe el input de búsqueda
        if (!container.querySelector('.table-search')) {
            const searchDiv = document.createElement('div');
            searchDiv.className = 'table-search';
            searchDiv.innerHTML = `
                <input type="text" 
                       id="search-${index}" 
                       placeholder="Buscar en la tabla..." 
                       class="search-input">
            `;
            container.insertBefore(searchDiv, table);
            
            // Agregar funcionalidad de búsqueda
            const searchInput = searchDiv.querySelector('input');
            searchInput.addEventListener('keyup', function() {
                filterTable(table, this.value);
            });
        }
    });
}

/**
 * Filtrar tabla por texto
 */
function filterTable(table, searchText) {
    const rows = table.querySelectorAll('tbody tr');
    const filter = searchText.toLowerCase();
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(filter) ? '' : 'none';
    });
}

/**
 * Validaciones de fechas
 */
function initDateValidations() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        // Establecer fecha mínima como hoy para citas futuras
        if (input.name === 'fecha' || input.name === 'fechaMantenimiento') {
            const today = new Date().toISOString().split('T')[0];
            input.setAttribute('min', today);
        }
        
        // Validar que no sea fecha futura para fechas de nacimiento
        if (input.name === 'fechaNacimiento') {
            const today = new Date().toISOString().split('T')[0];
            input.setAttribute('max', today);
        }
    });
}

/**
 * Resaltar menú activo
 */
function highlightActiveMenu() {
    const currentPath = window.location.pathname;
    const menuLinks = document.querySelectorAll('nav a');
    
    menuLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
}

/**
 * Formatear fechas en formato legible
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
}

/**
 * Mostrar notificación temporal
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Validar formulario antes de enviar
 */
function validateForm(formElement) {
    const requiredFields = formElement.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = '#dc3545';
            field.addEventListener('input', function() {
                this.style.borderColor = '';
            }, { once: true });
        }
    });
    
    if (!isValid) {
        showNotification('Por favor complete todos los campos requeridos', 'error');
    }
    
    return isValid;
}

/**
 * Cargar datos de forma asíncrona
 */
async function loadData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al cargar datos');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al cargar los datos', 'error');
        return null;
    }
}

/**
 * Exportar tabla a CSV
 */
function exportTableToCSV(tableId, filename = 'datos.csv') {
    const table = document.getElementById(tableId) || document.querySelector('table');
    if (!table) return;
    
    let csv = [];
    const rows = table.querySelectorAll('tr');
    
    rows.forEach(row => {
        const cols = row.querySelectorAll('td, th');
        const csvRow = [];
        cols.forEach(col => {
            // Excluir columna de acciones
            if (!col.querySelector('.btn')) {
                csvRow.push(col.textContent.trim());
            }
        });
        csv.push(csvRow.join(','));
    });
    
    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

/**
 * Imprimir tabla
 */
function printTable() {
    window.print();
}

// Agregar estilos para animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .table-search {
        margin: 15px 0;
    }
    
    .search-input {
        width: 100%;
        max-width: 400px;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 14px;
    }
    
    .search-input:focus {
        outline: none;
        border-color: #667eea;
    }
    
    nav a.active {
        background: rgba(255, 255, 255, 0.4) !important;
        font-weight: bold;
    }
`;
document.head.appendChild(style);