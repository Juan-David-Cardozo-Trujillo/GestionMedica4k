# Script para crear departamentos en la base de datos
Write-Host "Esperando a que el servidor inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# URL base de la API
$apiUrl = "http://localhost:8080/api"

# Primero, verificar que sedes existen
Write-Host "`nConsultando sedes hospitalarias..." -ForegroundColor Cyan
try {
    $sedes = Invoke-RestMethod -Uri "$apiUrl/sedes" -Method Get
    Write-Host "Sedes encontradas:" -ForegroundColor Green
    $sedes | ForEach-Object { Write-Host "  - ID: $($_.idsede), Nombre: $($_.nombresede)" }
    
    if ($sedes.Count -eq 0) {
        Write-Host "`nNo hay sedes en la base de datos. Primero debes crear una sede." -ForegroundColor Red
        exit
    }
    
    # Usar la primera sede disponible
    $idSede = $sedes[0].idsede
    Write-Host "`nUsando sede ID: $idSede" -ForegroundColor Yellow
    
} catch {
    Write-Host "Error al consultar sedes. Asumiendo idSede = 1" -ForegroundColor Yellow
    $idSede = 1
}

# Departamentos comunes en un hospital
$departamentos = @(
    "Consulta Externa",
    "Emergencias",
    "Medicina Interna",
    "Cirugia",
    "Pediatria",
    "Ginecologia y Obstetricia",
    "Cardiologia",
    "Radiologia",
    "Laboratorio Clinico",
    "Farmacia"
)

Write-Host "`nCreando departamentos..." -ForegroundColor Cyan

foreach ($nombreDepartamento in $departamentos) {
    $body = @{
        nombreDepartamento = $nombreDepartamento
        idSede = $idSede
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$apiUrl/departamentos" -Method Post -Body $body -ContentType "application/json"
        Write-Host "Creado: $nombreDepartamento" -ForegroundColor Green
    } catch {
        $errorMsg = $_.Exception.Message
        if ($errorMsg -match "duplicate key") {
            Write-Host "Ya existe: $nombreDepartamento" -ForegroundColor Yellow
        } else {
            Write-Host "Error al crear $nombreDepartamento" -ForegroundColor Red
        }
    }
}

Write-Host "`nProceso completado" -ForegroundColor Green
Write-Host "`nVerificando departamentos creados..." -ForegroundColor Cyan

try {
    $departamentosCreados = Invoke-RestMethod -Uri "$apiUrl/departamentos" -Method Get
    Write-Host "Total de departamentos: $($departamentosCreados.Count)" -ForegroundColor Green
    $departamentosCreados | ForEach-Object { 
        Write-Host "  - $($_.nombredepartamento) (Sede: $($_.idsede))" 
    }
} catch {
    Write-Host "Error al consultar departamentos" -ForegroundColor Red
}

