// src/main/resources/static/js/reports.js

/**
 * Sistema HIS+ - Funcionalidades de Reportes
 * Visualización y exportación de reportes
 */

document.addEventListener('DOMContentLoaded', function() {
    if (isReportPage()) {
        initReportFunctionality();
    }
});

/**
 * Verificar si estamos en una página de reportes
 */
function isReportPage() {
    return window.location.pathname.includes('/reportes');
}

/**
 * Inicializar funcionalidades de reportes
 */
function initReportFunctionality() {
    addExportButtons();
    addPrintButton();
    addRefreshButton();
    formatReportTables();
    addChartVisualization();
}

/**
 * Agregar botones de exportación
 */
function addExportButtons() {
    const container = document.querySelector('.container h2');
    if (!container) return;
    
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'report-actions';
    buttonGroup.style.cssText = 'display: inline-block; float: right; margin-top: 10px;';
    buttonGroup.innerHTML = `
        <button onclick="exportToExcel()" class="btn btn-secondary btn-sm" title="Exportar a Excel">
            📊 Excel
        </button>
        <button onclick="exportToPDF()" class="btn btn-secondary btn-sm" title="Exportar a PDF">
            📄 PDF
        </button>
        <button onclick="window.print()" class="btn btn-secondary btn-sm" title="Imprimir">
            🖨️ Imprimir
        </button>
    `;
    
    container.parentElement.insertBefore(buttonGroup, container.nextSibling);
}

/**
 * Agregar botón de impresión
 */
function addPrintButton() {
    const style = document.createElement('style');
    style.textContent = `
        @media print {
            .btn, .report-actions, nav, header nav {
                display: none !important;
            }
            .container {
                box-shadow: none;
                max-width: 100%;
            }
            table {
                page-break-inside: avoid;
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Agregar botón de refrescar
 */
function addRefreshButton() {
    const backButton = document.querySelector('a.btn-secondary');
    if (backButton) {
        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'btn btn-primary';
        refreshBtn.innerHTML = '🔄 Actualizar';
        refreshBtn.style.marginLeft = '10px';
        refreshBtn.onclick = () => location.reload();
        backButton.parentElement.insertBefore(refreshBtn, backButton.nextSibling);
    }
}

/**
 * Formatear tablas de reportes
 */
function formatReportTables() {
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        // Agregar clase para mejor estilo
        table.classList.add('report-table');
        
        // Agregar numeración de filas
        const tbody = table.querySelector('tbody');
        if (tbody) {
            const rows = tbody.querySelectorAll('tr');
            rows.forEach((row, index) => {
                const firstCell = row.querySelector('td');
                if (firstCell && !firstCell.textContent.match(/^\d+$/)) {
                    // No agregar si ya tiene número
                    const numberCell = document.createElement('td');
                    numberCell.textContent = index + 1;
                    numberCell.style.fontWeight = 'bold';
                    numberCell.style.textAlign = 'center';
                    row.insertBefore(numberCell, firstCell);
                }
            });
            
            // Agregar encabezado de número
            const thead = table.querySelector('thead tr');
            if (thead) {
                const numberHeader = document.createElement('th');
                numberHeader.textContent = '#';
                numberHeader.style.width = '50px';
                numberHeader.style.textAlign = 'center';
                thead.insertBefore(numberHeader, thead.firstChild);
            }
        }
        
        // Agregar suma total si es tabla numérica
        addTableSummary(table);
    });
}

/**
 * Agregar resumen de tabla con totales
 */
function addTableSummary(table) {
    const rows = table.querySelectorAll('tbody tr');
    if (rows.length === 0) return;
    
    // Buscar columnas numéricas
    const firstRow = rows[0];
    const cells = firstRow.querySelectorAll('td');
    const numericColumns = [];
    
    cells.forEach((cell, index) => {
        if (!isNaN(parseFloat(cell.textContent)) && isFinite(cell.textContent)) {
            numericColumns.push(index);
        }
    });
    
    if (numericColumns.length > 0) {
        const tfoot = document.createElement('tfoot');
        const totalRow = document.createElement('tr');
        totalRow.style.fontWeight = 'bold';
        totalRow.style.background = '#f8f9fa';
        
        for (let i = 0; i < cells.length; i++) {
            const cell = document.createElement('td');
            
            if (i === 0) {
                cell.textContent = 'TOTAL:';
                cell.colSpan = i + 1;
            } else if (numericColumns.includes(i)) {
                let sum = 0;
                rows.forEach(row => {
                    const value = parseFloat(row.cells[i].textContent);
                    if (!isNaN(value)) sum += value;
                });
                cell.textContent = sum.toFixed(2);
            } else {
                cell.textContent = '';
            }
            
            totalRow.appendChild(cell);
        }
        
        tfoot.appendChild(totalRow);
        table.appendChild(tfoot);
    }
}

/**
 * Exportar a Excel (CSV)
 */
function exportToExcel() {
    const table = document.querySelector('table');
    if (!table) {
        alert('No hay datos para exportar');
        return;
    }
    
    let csv = [];
    const rows = table.querySelectorAll('tr');
    
    rows.forEach(row => {
        const cols = row.querySelectorAll('td, th');
        const csvRow = [];
        cols.forEach(col => csvRow.push('"' + col.textContent.trim() + '"'));
        csv.push(csvRow.join(','));
    });
    
    const csvContent = '\ufeff' + csv.join('\n'); // BOM para Excel
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_${getReportName()}_${getFormattedDate()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Exportar a PDF (usar window.print)
 */
function exportToPDF() {
    alert('Utilice la función de imprimir de su navegador y seleccione "Guardar como PDF"');
    window.print();
}

/**
 * Obtener nombre del reporte
 */
function getReportName() {
    const title = document.querySelector('h2');
    if (title) {
        return title.textContent.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    }
    return 'reporte';
}

/**
 * Obtener fecha formateada
 */
function getFormattedDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

/**
 * Agregar visualización con gráficos
 */
function addChartVisualization() {
    const table = document.querySelector('table');
    if (!table) return;
    
    // Solo para tablas con datos numéricos
    const hasNumericData = checkForNumericData(table);
    if (!hasNumericData) return;
    
    const chartContainer = document.createElement('div');
    chartContainer.id = 'chartContainer';
    chartContainer.style.cssText = 'margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 10px;';
    
    const chartButton = document.createElement('button');
    chartButton.className = 'btn btn-primary';
    chartButton.innerHTML = '📊 Mostrar Gráfico';
    chartButton.onclick = () => toggleChart(table, chartContainer);
    
    table.parentElement.insertBefore(chartButton, table);
    table.parentElement.insertBefore(chartContainer, table);
    chartContainer.style.display = 'none';
}

/**
 * Verificar si la tabla tiene datos numéricos
 */
function checkForNumericData(table) {
    const cells = table.querySelectorAll('tbody td');
    for (let cell of cells) {
        if (!isNaN(parseFloat(cell.textContent)) && isFinite(cell.textContent)) {
            return true;
        }
    }
    return false;
}

/**
 * Alternar visualización de gráfico
 */
function toggleChart(table, container) {
    if (container.style.display === 'none') {
        container.style.display = 'block';
        createSimpleChart(table, container);
    } else {
        container.style.display = 'none';
    }
}

/**
 * Crear gráfico simple con CSS (sin librerías externas)
 */
function createSimpleChart(table, container) {
    const data = extractChartData(table);
    if (!data || data.values.length === 0) return;
    
    container.innerHTML = '<h3 style="text-align: center; color: #333;">Visualización de Datos</h3>';
    
    const chartDiv = document.createElement('div');
    chartDiv.style.cssText = 'display: flex; align-items: flex-end; justify-content: space-around; height: 300px; padding: 20px; background: white; border-radius: 5px;';
    
    const maxValue = Math.max(...data.values);
    
    data.labels.forEach((label, index) => {
        const value = data.values[index];
        const height = (value / maxValue) * 250;
        
        const bar = document.createElement('div');
        bar.style.cssText = `
            flex: 1;
            margin: 0 5px;
            background: linear-gradient(to top, #667eea, #764ba2);
            height: ${height}px;
            border-radius: 5px 5px 0 0;
            position: relative;
            transition: all 0.3s;
            cursor: pointer;
        `;
        
        bar.innerHTML = `
            <div style="position: absolute; top: -25px; left: 0; right: 0; text-align: center; font-weight: bold; color: #667eea;">
                ${value}
            </div>
            <div style="position: absolute; bottom: -40px; left: 0; right: 0; text-align: center; font-size: 11px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${label}
            </div>
        `;
        
        bar.onmouseenter = function() {
            this.style.opacity = '0.8';
            this.style.transform = 'scale(1.05)';
        };
        
        bar.onmouseleave = function() {
            this.style.opacity = '1';
            this.style.transform = 'scale(1)';
        };
        
        chartDiv.appendChild(bar);
    });
    
    container.appendChild(chartDiv);
}

/**
 * Extraer datos para gráfico
 */
function extractChartData(table) {
    const labels = [];
    const values = [];
    
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
            labels.push(cells[0].textContent.trim());
            
            // Buscar la primera celda numérica
            for (let i = 1; i < cells.length; i++) {
                const value = parseFloat(cells[i].textContent);
                if (!isNaN(value) && isFinite(value)) {
                    values.push(value);
                    break;
                }
            }
        }
    });
    
    return { labels, values };
}

/**
 * Agregar estadísticas resumidas
 */
function addReportStatistics() {
    const table = document.querySelector('table');
    if (!table) return;
    
    const rows = table.querySelectorAll('tbody tr');
    const statsDiv = document.createElement('div');
    statsDiv.className = 'report-statistics';
    statsDiv.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin: 20px 0;
    `;
    
    statsDiv.innerHTML = `
        <div class="stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center;">
            <h4 style="margin: 0; font-size: 14px; opacity: 0.9;">Total Registros</h4>
            <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold;">${rows.length}</p>
        </div>
    `;
    
    table.parentElement.insertBefore(statsDiv, table);
}

// Inicializar estadísticas si estamos en página de reporte
if (isReportPage()) {
    window.addEventListener('load', addReportStatistics);
}