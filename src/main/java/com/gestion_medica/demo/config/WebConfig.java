package com.gestion_medica.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Aplica a todo el sistema
                // --- CAMBIO CLAVE AQUÍ ABAJO ---
                // NO uses .allowedOrigins("*")
                // USA .allowedOriginPatterns("*") <- Esto SÍ funciona con credenciales
                .allowedOriginPatterns("*")
                // -------------------------------
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);

        System.out.println("✅ Configuración CORS (Patterns) Cargada");
    }
}
