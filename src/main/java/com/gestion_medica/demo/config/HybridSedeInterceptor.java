package com.gestion_medica.demo.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class HybridSedeInterceptor implements HandlerInterceptor {
    
    @Override
    public boolean preHandle(HttpServletRequest request, 
                           HttpServletResponse response, 
                           Object handler) throws Exception {
        
        // 1. Determinar si es una operación sobre tablas compartidas o locales
        String requestURI = request.getRequestURI();
        
        // Rutas que acceden a tablas COMPARTIDAS
        if (isSharedTableRequest(requestURI)) {
            SedeContextHolder.setSedeDataSource("SHARED");
            System.out.println("🌐 Request a tabla COMPARTIDA: " + requestURI);
            return true;
        }
        
        // Para tablas LOCALES, determinar la sede del usuario
        String idSedeStr = obtenerIdSede(request);
        
        if (idSedeStr != null) {
            try {
                Integer idSede = Integer.parseInt(idSedeStr);
                String dataSource = mapSedeToDataSource(idSede);
                
                SedeContextHolder.setSedeDataSource(dataSource);
                System.out.println("🏥 Request a sede " + idSede + " → DataSource: " + dataSource);
                
            } catch (NumberFormatException e) {
                System.err.println("❌ ID Sede inválido: " + idSedeStr);
                SedeContextHolder.setSedeDataSource("SHARED");
            }
        } else {
            // Si no hay sede, usar SHARED por defecto
            SedeContextHolder.setSedeDataSource("SHARED");
        }
        
        return true;
    }
    
    /**
     * Determina si el request es para una tabla compartida
     */
    private boolean isSharedTableRequest(String uri) {
        return uri.contains("/personas") ||
               uri.contains("/usuarios") ||
               uri.contains("/enfermedades") ||
               uri.contains("/medicamentos") ||
               uri.contains("/sedes") ||
               uri.contains("/login");
    }
    
    /**
     * Obtiene el ID de Sede del request
     */
    private String obtenerIdSede(HttpServletRequest request) {
        // 1. Desde header
        String idSede = request.getHeader("X-Sede-Id");
        if (idSede != null) return idSede;
        
        // 2. Desde parámetro
        idSede = request.getParameter("idSede");
        if (idSede != null) return idSede;
        
        // 3. Desde sesión
        Object sedeAttr = request.getSession().getAttribute("idSede");
        if (sedeAttr != null) return sedeAttr.toString();
        
        return null;
    }
    
    /**
     * Mapea ID de Sede a DataSource
     */
    private String mapSedeToDataSource(Integer idSede) {
        switch (idSede) {
            case 1:
                return "SEDE1"; // AWS Local
            case 2:
                return "SEDE2"; // Azure Local
            default:
                System.err.println("⚠️ Sede desconocida: " + idSede);
                return "SHARED";
        }
    }
    
    @Override
    public void afterCompletion(HttpServletRequest request, 
                               HttpServletResponse response, 
                               Object handler, 
                               Exception ex) throws Exception {
        SedeContextHolder.clear();
    }
}