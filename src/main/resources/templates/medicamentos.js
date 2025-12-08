// medicamentos.js
const API_URL = 'http://localhost:3000/api';
let currentMedicamento = null;
let allMedicamentos = [];
let userRole = localStorage.getItem('userRole') || 'AsistenteBodega';

document.addEventListener('DOMContentLoaded', () => {
    checkPermissions();
    loadMedicamentos();
});

// Verificar permisos
function checkPermissions() {
    const readOnlyRoles = ['Medico', 'TecnicoMantenimiento'];
    if (readOnlyRoles.includes(userRole)) {
        document.getElementById('btnNuevo').style.display = 'none';
        document.querySelector('.acciones-col').style.display = 'none';
    }
}

// Cargar medicamentos
async function loadMedicamentos() {
    try {
        const response = await fetch(`${API_URL}/medicamentos`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (!response.ok) throw new Error('Error al cargar');
        
        allMedicamentos = await response.json();
        renderMedicamentos(allMedicamentos);
        updateStats();
        populateProveedorFilter();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al cargar medicamentos', 'error');
    }
}

// Renderizar tabla
function renderMedicamentos(medicamentos) {
    const tbody = document.getElementById('medicamentosBody');
    tbody.innerHTML = '';
    
    if (medicamentos.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="8" style="text-align:center; padding:40px;">
                No hay medicamentos registrados
            </td></tr>
        `;
        return;
    }
    
    medicamentos.forEach(med => {
        const stockClass = med.stock < 50 ? 'stock-bajo' : 
                          med.stock < 200 ? 'stock-medio' : 'stock-alto';
        const estadoClass = med.stock > 0 ? 'disponible' : 'agotado';
        const estado = med.stock > 0 ? 'Disponible' : 'Agotado';
        
        const accionesHTML = userRole === 'AsistenteBodega' || userRole === 'Administrador' ? `
            <button class="btn-icon" onclick="showDetails(${med.codmed})" title="Ver">👁️</button>
            <button class="btn-icon" onclick='editMedicamento(${JSON.stringify(med)})' title="Editar">✏️</button>
            <button class="btn-icon" onclick="deleteMedicamento(${med.codmed})" title="Eliminar">🗑️</button>
        ` : `
            <button class="btn-icon" onclick="showDetails(${med.codmed})" title="Ver">👁️</button>
        `;
        
        tbody.innerHTML += `
            <tr>
                <td>${med.codmed}</td>
                <td>${med.nombremed}</td>
                <td>${med.descripcion}</td>
                <td>${med.unidad}</td>
                <td><span class="stock-badge ${stockClass}">${med.stock}</span></td>
                <td>${med.proveedor}</td>
                <td><span class="status-badge ${estadoClass}">${estado}</span></td>
                <td class="acciones-col">${accionesHTML}</td>
            </tr>
        `;
    });
}

// Actualizar estadísticas
function updateStats() {
    document.getElementById('totalMedicamentos').textContent = allMedicamentos.length;
    document.getElementById('stockBajo').textContent = 
        allMedicamentos.filter(m => m.stock < 50).length;
    document.getElementById('disponibles').textContent = 
        allMedicamentos.filter(m => m.stock > 0).length;
}

// Poblar filtro de proveedores
function populateProveedorFilter() {
    const proveedores = [...new Set(allMedicamentos.map(m => m.proveedor))];
    const select = document.getElementById('filterProveedor');
    proveedores.forEach(p => {
        select.innerHTML += `<option value="${p}">${p}</option>`;
    });
}

// Abrir modal
function openModal(medicamento = null) {
    const modal = document.getElementById('medicamentoModal');
    const form = document.getElementById('medicamentoForm');
    const title = document.getElementById('modalTitle');
    
    if (medicamento) {
        title.textContent = 'Editar Medicamento';
        currentMedicamento = medicamento;
        document.getElementById('nombreMed').value = medicamento.nombremed;
        document.getElementById('descripcion').value = medicamento.descripcion;
        document.getElementById('unidad').value = medicamento.unidad;
        document.getElementById('stock').value = medicamento.stock;
        document.getElementById('proveedor').value = medicamento.proveedor;
    } else {
        title.textContent = 'Nuevo Medicamento';
        currentMedicamento = null;
        form.reset();
    }
    
    modal.style.display = 'block';
}

// Cerrar modal
function closeModal() {
    document.getElementById('medicamentoModal').style.display = 'none';
}

// Guardar medicamento
async function saveMedicamento(event) {
    event.preventDefault();
    
    const data = {
        nombreMed: document.getElementById('nombreMed').value.trim(),
        descripcion: document.getElementById('descripcion').value.trim(),
        unidad: document.getElementById('unidad').value,
        stock: parseInt(document.getElementById('stock').value),
        proveedor: document.getElementById('proveedor').value.trim()
    };
    
    try {
        const url = currentMedicamento 
            ? `${API_URL}/medicamentos/${currentMedicamento.codmed}`
            : `${API_URL}/medicamentos`;
        const method = currentMedicamento ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Error al guardar');
        
        showNotification('Medicamento guardado correctamente', 'success');
        closeModal();
        loadMedicamentos();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al guardar medicamento', 'error');
    }
}

// Editar medicamento
function editMedicamento(medicamento) {
    openModal(medicamento);
}

// Mostrar detalles
async function showDetails(codMed) {
    try {
        const response = await fetch(`${API_URL}/medicamentos/${codMed}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const med = await response.json();
        currentMedicamento = med;
        
        const stockClass = med.stock < 50 ? 'stock-bajo' : 
                          med.stock < 200 ? 'stock-medio' : 'stock-alto';
        
        document.getElementById('medicamentoDetalles').innerHTML = `
            <div class="detail-row">
                <strong>Código:</strong> <span>${med.codmed}</span>
            </div>
            <div class="detail-row">
                <strong>Nombre:</strong> <span>${med.nombremed}</span>
            </div>
            <div class="detail-row">
                <strong>Descripción:</strong> <span>${med.descripcion}</span>
            </div>
            <div class="detail-row">
                <strong>Unidad:</strong> <span>${med.unidad}</span>
            </div>
            <div class="detail-row">
                <strong>Stock Actual:</strong> 
                <span class="stock-badge ${stockClass}">${med.stock}</span>
            </div>
            <div class="detail-row">
                <strong>Proveedor:</strong> <span>${med.proveedor}</span>
            </div>
            <div class="detail-row">
                <strong>Estado:</strong> 
                <span class="status-badge ${med.stock > 0 ? 'disponible' : 'agotado'}">
                    ${med.stock > 0 ? 'Disponible' : 'Agotado'}
                </span>
            </div>
        `;
        
        // Mostrar u ocultar sección de actualizar stock según rol
        const stockSection = document.querySelector('.stock-section');
        if (userRole === 'AsistenteBodega' || userRole === 'Administrador') {
            stockSection.style.display = 'block';
        } else {
            stockSection.style.display = 'none';
        }
        
        document.getElementById('detallesModal').style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al cargar detalles', 'error');
    }
}

// Cerrar modal detalles
function closeDetallesModal() {
    document.getElementById('detallesModal').style.display = 'none';
    document.getElementById('stockForm').reset();
}

// Actualizar stock
async function updateStock(event) {
    event.preventDefault();
    
    const tipo = document.getElementById('tipoMovimiento').value;
    const cantidad = parseInt(document.getElementById('cantidadMovimiento').value);
    const motivo = document.getElementById('motivoMovimiento').value;
    
    const nuevoStock = tipo === 'entrada' 
        ? currentMedicamento.stock + cantidad
        : currentMedicamento.stock - cantidad;
    
    if (nuevoStock < 0) {
        showNotification('Stock insuficiente para realizar la salida', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/medicamentos/${currentMedicamento.codmed}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                ...currentMedicamento,
                stock: nuevoStock
            })
        });
        
        if (!response.ok) throw new Error('Error al actualizar');
        
        showNotification(`Stock actualizado: ${tipo === 'entrada' ? '+' : '-'}${cantidad} unidades`, 'success');
        closeDetallesModal();
        loadMedicamentos();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al actualizar stock', 'error');
    }
}

// Eliminar medicamento
async function deleteMedicamento(codMed) {
    if (!confirm('¿Eliminar este medicamento?')) return;
    
    try {
        const response = await fetch(`${API_URL}/medicamentos/${codMed}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (!response.ok) throw new Error('Error');
        
        showNotification('Medicamento eliminado', 'success');
        loadMedicamentos();
    } catch (error) {
        showNotification('Error al eliminar', 'error');
    }
}

// Filtrar medicamentos
function filterMedicamentos() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const stockFilter = document.getElementById('filterStock').value;
    const proveedorFilter = document.getElementById('filterProveedor').value;
    
    const filtered = allMedicamentos.filter(med => {
        const matchSearch = med.nombremed.toLowerCase().includes(search) ||
                          med.descripcion.toLowerCase().includes(search) ||
                          med.codmed.toString().includes(search);
        
        let matchStock = true;
        if (stockFilter === 'bajo') matchStock = med.stock < 50;
        if (stockFilter === 'medio') matchStock = med.stock >= 50 && med.stock <= 200;
        if (stockFilter === 'alto') matchStock = med.stock > 200;
        
        const matchProveedor = !proveedorFilter || med.proveedor === proveedorFilter;
        
        return matchSearch && matchStock && matchProveedor;
    });
    
    renderMedicamentos(filtered);
}

// Notificaciones
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} show`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}