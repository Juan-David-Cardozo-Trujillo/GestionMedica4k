package com.gestion_medica.demo.service;

import com.gestion_medica.demo.repository.ReporteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class ReporteService {

    @Autowired
    private ReporteRepository repository;

    public List<Map<String, Object>> getMedicamentosMasRecetadosPorSede() {
        return repository.getMedicamentosMasRecetadosPorSede();
    }

    public List<Map<String, Object>> getMedicosConMasConsultasPorSemana() {
        return repository.getMedicosConMasConsultasPorSemana();
    }

    public Map<String, Object> getTiempoPromedioCitaDiagnostico() {
        return repository.getTiempoPromedioCitaDiagnostico();
    }

    public List<Map<String, Object>> getAuditoriaHistoriasClinicas() {
        return repository.getAuditoriaHistoriasClinicas();
    }

    public List<Map<String, Object>> getDepartamentosCompartenEquipamiento() {
        return repository.getDepartamentosCompartenEquipamiento();
    }

    public List<Map<String, Object>> getPacientesPorEnfermedadYSede() {
        return repository.getPacientesPorEnfermedadYSede();
    }
}
