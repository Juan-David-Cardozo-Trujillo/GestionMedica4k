package com.gestion_medica.demo.config;

public class SedeContextHolder {
    
    private static final ThreadLocal<String> CONTEXT = new ThreadLocal<>();
    
    /**
     * Establece el DataSource (SHARED, SEDE1, SEDE2)
     */
    public static void setSedeDataSource(String dataSource) {
        CONTEXT.set(dataSource);
        System.out.println("🔧 SedeContextHolder: DataSource = " + dataSource);
    }
    
    /**
     * Obtiene el DataSource actual
     */
    public static String getSedeDataSource() {
        String dataSource = CONTEXT.get();
        if (dataSource == null) {
            return "SHARED"; // Default
        }
        return dataSource;
    }
    
    /**
     * Limpia el contexto
     */
    public static void clear() {
        CONTEXT.remove();
        System.out.println("🧹 SedeContextHolder: Contexto limpiado");
    }
}