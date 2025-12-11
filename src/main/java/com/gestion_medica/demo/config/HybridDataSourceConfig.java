package com.gestion_medica.demo.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class HybridDataSourceConfig {

    /**
     * DataSource COMPARTIDO - Tablas maestras
     * Ubicación: AWS (his_compartida)
     * Tablas: Persona, Usuario, Enfermedades, Medicamentos, Sedes_Hospitalarias
     */
    @Bean(name = "sharedDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.shared")
    public DataSource sharedDataSource() {
        System.out.println("📚 Configurando DataSource COMPARTIDO (Tablas Maestras)");
        return DataSourceBuilder.create()
                .type(HikariDataSource.class)
                .build();
    }

    /**
     * DataSource SEDE 1 - Datos operacionales
     * Ubicación: AWS (his_sede1)
     * Tablas: Pacientes, Empleados, Citas, Historias_Clinicas, etc.
     */
    @Bean(name = "sede1DataSource")
    @ConfigurationProperties(prefix = "spring.datasource.sede1")
    public DataSource sede1DataSource() {
        System.out.println("🏥 Configurando DataSource SEDE 1 (AWS Local)");
        return DataSourceBuilder.create()
                .type(HikariDataSource.class)
                .build();
    }

    /**
     * DataSource SEDE 2 - Datos operacionales
     * Ubicación: Azure (his_sede2)
     * Tablas: Pacientes, Empleados, Citas, Historias_Clinicas, etc.
     */
    @Bean(name = "sede2DataSource")
    @ConfigurationProperties(prefix = "spring.datasource.sede2")
    public DataSource sede2DataSource() {
        System.out.println("🏥 Configurando DataSource SEDE 2 (Azure Local)");
        return DataSourceBuilder.create()
                .type(HikariDataSource.class)
                .build();
    }

    /**
     * Routing DataSource Principal
     * Enruta dinámicamente según el contexto
     */
    @Primary
    @Bean(name = "routingDataSource")
    public DataSource routingDataSource(
            @Qualifier("sharedDataSource") DataSource shared,
            @Qualifier("sede1DataSource") DataSource sede1,
            @Qualifier("sede2DataSource") DataSource sede2) {
        
        HybridRoutingDataSource routing = new HybridRoutingDataSource();
        
        Map<Object, Object> dataSources = new HashMap<>();
        dataSources.put("SHARED", shared);
        dataSources.put("SEDE1", sede1);
        dataSources.put("SEDE2", sede2);
        
        routing.setTargetDataSources(dataSources);
        routing.setDefaultTargetDataSource(shared); // Default a tablas compartidas
        
        System.out.println("✅ Routing DataSource configurado:");
        System.out.println("   - SHARED: Tablas maestras (Persona, Usuario, Enfermedades, Medicamentos)");
        System.out.println("   - SEDE1: Datos operacionales Sede 1");
        System.out.println("   - SEDE2: Datos operacionales Sede 2");
        
        return routing;
    }
}