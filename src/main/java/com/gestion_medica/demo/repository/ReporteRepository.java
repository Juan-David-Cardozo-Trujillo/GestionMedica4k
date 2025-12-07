package com.gestion_medica.demo.repository;

import com.gestion_medica.demo.model.ReporteMedico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Map;


@Repository
public interface ReporteRepository extends JpaRepository<ReporteMedico, Integer> {

    // CONSULTA 1: Medicamentos más recetados por sede
    @Query(value = "select nombresede, nombremed, total_recetas "
            + "from med_por_sedes natural join max_medicamento_sedes "
            + "where total_recetas = max_recetas",
            nativeQuery = true)
    List<Map<String, Object>> getMedicamentosMasRecetadosPorSede();

    // CONSULTA 2: Médicos con mayor número de consultas por semana
    @Query(value = "select nombrepersona, apellidopersona, semana "
            + "from num_consultas_semana natural join max_consultas_semanas "
            + "where total_consultas = record_consultas",
            nativeQuery = true)
    List<Map<String, Object>> getMedicosConMasConsultasPorSemana();

    // CONSULTA 3: Tiempo promedio cita - diagnóstico
    @Query(value = "select avg(duracion) as promedio_duracion from duracion_citas",
            nativeQuery = true)
    Map<String, Object> getTiempoPromedioCitaDiagnostico();

    // CONSULTA 4: Auditoría Historias Clínicas
    @Query(value = "select * from vista_auditoria "
            + "where tablaafectada = 'historias_clinicas' "
            + "order by fechaevento desc limit 10",
            nativeQuery = true)
    List<Map<String, Object>> getAuditoriaHistoriasClinicas();

    // CONSULTA 5: Departamentos que comparten equipamiento
    @Query(value = "select idsede, nombredepartamento from equip_por_dept_sedes "
            + "where codequip in (select codequip from equip_por_dept_sedes "
            + "group by codequip having count(distinct idsede) > 1)",
            nativeQuery = true)
    List<Map<String, Object>> getDepartamentosCompartenEquipamiento();

    // CONSULTA 6: Total pacientes por enfermedad y sede
    @Query(value = "select * from pacientesenfermedadsede",
            nativeQuery = true)
    List<Map<String, Object>> getPacientesPorEnfermedadYSede();
}
