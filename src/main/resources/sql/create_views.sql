-- ==========================================
-- SCRIPT DE CREACIÓN DE VISTAS PARA REPORTES
-- ==========================================
-- Ejecute este script en su base de datos PostgreSQL

-- --------------------------------------------------------------------------------------
-- Consulta 1: Listar los medicamentos más recetados por sede
-- --------------------------------------------------------------------------------------
DROP VIEW IF EXISTS Med_Por_Sedes, Max_Medicamento_Sedes CASCADE;

CREATE VIEW Med_Por_Sedes AS 
SELECT 
    s.nombreSede, 
    m.nombreMed, 
    COUNT(*) AS total_recetas 
FROM citas c 
JOIN citas_prescribe_medicamentos cm ON c.idcita = cm.idcita 
JOIN medicamentos m ON cm.codmed = m.codmed 
JOIN empleados e ON c.numdocumentoemp = e.numdocumento AND c.idempleado = e.idempleado 
JOIN sedes_hospitalarias s ON e.idsede = s.idsede 
WHERE cm.fechaEmision >= CURRENT_DATE - INTERVAL '1 month' 
GROUP BY s.nombreSede, m.nombreMed;

CREATE VIEW Max_Medicamento_Sedes AS 
SELECT 
    nombreSede, 
    MAX(total_recetas) AS max_recetas 
FROM Med_Por_Sedes 
GROUP BY nombreSede;

-- Uso:
-- SELECT nombreSede, nombreMed, total_recetas FROM Med_Por_Sedes NATURAL JOIN Max_Medicamento_Sedes WHERE total_recetas = max_recetas;


-- --------------------------------------------------------------------------------------
-- Consulta 2: Médicos con mayor número de consultas atendidas por semana
-- --------------------------------------------------------------------------------------
DROP VIEW IF EXISTS vista_consultas_semana, vista_max_consultas, num_consultas_semana, max_consultas_semanas CASCADE;

CREATE VIEW num_consultas_semana AS 
SELECT 
    persona.nombrepersona, 
    persona.apellidopersona, 
    empleados.cargo, 
    empleados.nombredepartamento, 
    sedes_hospitalarias.nombresede, 
    EXTRACT(YEAR FROM citas.fecha) AS ano, 
    EXTRACT(MONTH FROM citas.fecha) AS mes, 
    EXTRACT(WEEK FROM citas.fecha) AS semana, 
    COUNT(citas.idcita) AS total_consultas 
FROM empleados 
INNER JOIN persona ON empleados.numdocumento = persona.numdocumento 
INNER JOIN citas ON empleados.numdocumento = citas.numdocumentoemp AND empleados.idempleado = citas.idempleado 
INNER JOIN departamentos ON empleados.nombredepartamento = departamentos.nombredepartamento AND empleados.idsede = departamentos.idsede 
INNER JOIN sedes_hospitalarias ON empleados.idsede = sedes_hospitalarias.idsede 
WHERE citas.estado = 'Tomada' 
GROUP BY persona.nombrepersona, persona.apellidopersona, empleados.cargo, empleados.nombredepartamento, sedes_hospitalarias.nombresede, EXTRACT(YEAR FROM citas.fecha), EXTRACT(MONTH FROM citas.fecha), EXTRACT(WEEK FROM citas.fecha);

CREATE VIEW max_consultas_semanas AS 
SELECT 
    semana, 
    MAX(total_consultas) AS record_consultas 
FROM num_consultas_semana 
GROUP BY semana;

-- Uso:
-- SELECT nombrePersona, apellidoPersona, semana FROM num_consultas_semana NATURAL JOIN max_consultas_semanas WHERE total_consultas = record_consultas;


-- --------------------------------------------------------------------------------------
-- Consulta 3: Tiempo promedio cita - diagnóstico
-- --------------------------------------------------------------------------------------
DROP VIEW IF EXISTS duracion_citas CASCADE;

CREATE VIEW duracion_citas AS 
SELECT 
    c.idCita, 
    c.hora, 
    r.horaRegistro, 
    (r.horaRegistro - c.hora) AS duracion 
FROM historias_clinicas_registra_diagnostica r 
JOIN citas c ON r.idCita = c.idCita;

-- Uso:
-- SELECT AVG(duracion) AS promedio_duracion FROM duracion_citas;


-- --------------------------------------------------------------------------------------
-- Consulta 4: Auditoría Historias Clínicas
-- --------------------------------------------------------------------------------------
DROP VIEW IF EXISTS vista_auditoria CASCADE;

CREATE VIEW vista_auditoria AS 
SELECT 
    a.idEvento, 
    a.fechaEvento, 
    a.accion, 
    a.tablaAfectada, 
    a.ipOrigen, 
    u.nombreUsuario, 
    p.nombrePersona, 
    p.apellidoPersona 
FROM auditoria_accesos a 
JOIN usuario u ON a.idUsuario = u.idUsuario 
JOIN persona p ON u.numDocumento = p.numDocumento;

-- Uso:
-- SELECT * FROM vista_auditoria WHERE tablaAfectada = 'historias_clinicas' ORDER BY fechaEvento DESC LIMIT 10;


-- --------------------------------------------------------------------------------------
-- Consulta 5: Departamentos que comparten equipamiento
-- --------------------------------------------------------------------------------------
DROP VIEW IF EXISTS equip_por_dept_sedes CASCADE;

CREATE VIEW equip_por_dept_sedes AS 
SELECT 
    d.idSede, 
    d.nombreDepartamento, 
    e.codEquip, 
    e.nombreEquip 
FROM departamentos d 
JOIN equipamientos_usa_departamentos ed ON d.nombreDepartamento = ed.nombreDepartamento AND d.idSede = ed.idSede 
JOIN equipamientos e ON ed.codEquip = e.codEquip;

-- Uso:
-- SELECT idSede, nombreDepartamento FROM equip_por_dept_sedes WHERE codEquip IN (SELECT codEquip FROM equip_por_dept_sedes GROUP BY codEquip HAVING COUNT(DISTINCT idSede) > 1);


-- --------------------------------------------------------------------------------------
-- Consulta 6: Total pacientes por enfermedad y sede
-- --------------------------------------------------------------------------------------
DROP VIEW IF EXISTS pacientesenfermedadsede CASCADE;

CREATE VIEW pacientesenfermedadsede AS 
SELECT 
    s.nombreSede, 
    enf.nombreEnfermedad, 
    COUNT(DISTINCT c.codPaciente) AS total_pacientes 
FROM citas c 
JOIN citas_diagnostica_enfermedades cde ON c.idCita = cde.idCita 
JOIN enfermedades enf ON cde.idEnfermedad = enf.idEnfermedad 
JOIN empleados e ON c.numDocumentoEmp = e.numDocumento AND c.idEmpleado = e.idEmpleado 
JOIN sedes_hospitalarias s ON e.idSede = s.idSede 
WHERE c.estado = 'Tomada' 
GROUP BY s.nombreSede, enf.nombreEnfermedad 
ORDER BY s.nombreSede, total_pacientes DESC;

-- Uso:
-- SELECT * FROM pacientesenfermedadsede;
