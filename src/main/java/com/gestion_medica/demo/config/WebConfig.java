package com.gestion_medica.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuración Web para recursos estáticos y CORS IMPORTANTE: NO usar
 * @EnableWebMvc ya que deshabilita la autoconfiguración de Spring Boot
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Mapeo explícito de recursos estáticos
        registry
                .addResourceHandler("/css/**")
                .addResourceLocations("classpath:/static/css/")
                .setCachePeriod(0); // Sin caché en desarrollo

        registry
                .addResourceHandler("/js/**")
                .addResourceLocations("classpath:/static/js/")
                .setCachePeriod(0);

        registry
                .addResourceHandler("/images/**")
                .addResourceLocations("classpath:/static/images/")
                .setCachePeriod(0);

        registry
                .addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(0);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Configuración CORS para todas las rutas
        registry.addMapping("/**")
                // Orígenes permitidos
                .allowedOrigins(
                        "http://localhost:8080",
                        "http://127.0.0.1:8080",
                        "http://localhost:3000",
                        "http://127.0.0.1:3000",
                        "http://localhost:5500",
                        "http://127.0.0.1:5500"
                )
                // Métodos HTTP permitidos
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD")
                // Headers permitidos
                .allowedHeaders("*")
                // Permitir credenciales (cookies, headers de autorización)
                .allowCredentials(true)
                // Tiempo de cache para preflight requests (1 hora)
                .maxAge(3600);

        // Configuración específica para API REST
        registry.addMapping("/api/**")
                .allowedOrigins("*") // En desarrollo permitir todos
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false) // False cuando usas allowedOrigins("*")
                .maxAge(3600);
    }
}
