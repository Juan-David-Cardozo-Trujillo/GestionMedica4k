package com.gestion_medica.demo.config;

import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

/**
 * DataSource que enruta dinámicamente según el contexto de Sede
 */
public class SedeRoutingDataSource extends AbstractRoutingDataSource {
    
    @Override
    protected Object determineCurrentLookupKey() {
        String dataSource = SedeContextHolder.getSedeDataSource();
        System.out.println("📍 Routing a DataSource: " + dataSource);
        return dataSource;
    }
}