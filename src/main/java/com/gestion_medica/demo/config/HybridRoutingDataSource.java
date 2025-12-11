package com.gestion_medica.demo.config;

import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

public class HybridRoutingDataSource extends AbstractRoutingDataSource {
    
    @Override
    protected Object determineCurrentLookupKey() {
        String dataSource = SedeContextHolder.getSedeDataSource();
        
        // Si no hay contexto específico, usar SHARED por defecto
        if (dataSource == null || dataSource.isEmpty()) {
            System.out.println("📍 Routing a DataSource: SHARED (default)");
            return "SHARED";
        }
        
        System.out.println("📍 Routing a DataSource: " + dataSource);
        return dataSource;
    }
}