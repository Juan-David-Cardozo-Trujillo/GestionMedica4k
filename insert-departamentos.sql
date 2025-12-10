-- Primero, crear una sede si no existe (sin especificar idSede, se autogenera)
INSERT INTO Sedes_Hospitalarias (nombreSede) 
VALUES ('Sede Principal') 
ON CONFLICT DO NOTHING;

-- Obtener el id de la sede (normalmente será 1 si es la primera)
-- Insertar departamentos usando el idSede existente
INSERT INTO Departamentos (nombreDepartamento, idSede) 
SELECT 'Consulta Externa', idSede FROM Sedes_Hospitalarias WHERE nombreSede = 'Sede Principal'
ON CONFLICT DO NOTHING;

INSERT INTO Departamentos (nombreDepartamento, idSede) 
SELECT 'Emergencias', idSede FROM Sedes_Hospitalarias WHERE nombreSede = 'Sede Principal'
ON CONFLICT DO NOTHING;

INSERT INTO Departamentos (nombreDepartamento, idSede) 
SELECT 'Medicina Interna', idSede FROM Sedes_Hospitalarias WHERE nombreSede = 'Sede Principal'
ON CONFLICT DO NOTHING;

INSERT INTO Departamentos (nombreDepartamento, idSede) 
SELECT 'Cirugia', idSede FROM Sedes_Hospitalarias WHERE nombreSede = 'Sede Principal'
ON CONFLICT DO NOTHING;

INSERT INTO Departamentos (nombreDepartamento, idSede) 
SELECT 'Pediatria', idSede FROM Sedes_Hospitalarias WHERE nombreSede = 'Sede Principal'
ON CONFLICT DO NOTHING;

INSERT INTO Departamentos (nombreDepartamento, idSede) 
SELECT 'Ginecologia', idSede FROM Sedes_Hospitalarias WHERE nombreSede = 'Sede Principal'
ON CONFLICT DO NOTHING;

INSERT INTO Departamentos (nombreDepartamento, idSede) 
SELECT 'Cardiologia', idSede FROM Sedes_Hospitalarias WHERE nombreSede = 'Sede Principal'
ON CONFLICT DO NOTHING;

INSERT INTO Departamentos (nombreDepartamento, idSede) 
SELECT 'Radiologia', idSede FROM Sedes_Hospitalarias WHERE nombreSede = 'Sede Principal'
ON CONFLICT DO NOTHING;

INSERT INTO Departamentos (nombreDepartamento, idSede) 
SELECT 'Laboratorio', idSede FROM Sedes_Hospitalarias WHERE nombreSede = 'Sede Principal'
ON CONFLICT DO NOTHING;

INSERT INTO Departamentos (nombreDepartamento, idSede) 
SELECT 'Farmacia', idSede FROM Sedes_Hospitalarias WHERE nombreSede = 'Sede Principal'
ON CONFLICT DO NOTHING;

-- Verificar resultados
SELECT 'SEDES CREADAS:' as resultado;
SELECT * FROM Sedes_Hospitalarias;

SELECT 'DEPARTAMENTOS CREADOS:' as resultado;
SELECT * FROM Departamentos;
