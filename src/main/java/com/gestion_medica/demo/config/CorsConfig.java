package com.gestion_medica.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    /**
     * Configuración CORS global para todos los endpoints
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                // Orígenes permitidos - en producción especifica los dominios exactos
                .allowedOrigins(
                        "http://localhost:8080",
                        "http://127.0.0.1:8080",
                        "http://localhost:3000",
                        "http://127.0.0.1:3000",
                        "http://localhost:5500",
                        "http://127.0.0.1:5500"
                )
                // Métodos HTTP permitidos
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                // Headers permitidos
                .allowedHeaders("*")
                // Permitir envío de credenciales (cookies, authorization headers)
                .allowCredentials(true)
                // Tiempo de cache para preflight requests (1 hora)
                .maxAge(3600);
    }

    /**
     * Bean de configuración CORS alternativo (más detallado) Este se usa si
     * necesitas configuraciones diferentes por ruta
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Orígenes permitidos
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:8080",
                "http://127.0.0.1:8080",
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:5500",
                "http://127.0.0.1:5500"
        ));

        // Métodos HTTP permitidos
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"
        ));

        // Headers permitidos
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "Accept",
                "Origin",
                "Access-Control-Request-Method",
                "Access-Control-Request-Headers",
                "X-Requested-With"
        ));

        // Headers expuestos al cliente
        configuration.setExposedHeaders(Arrays.asList(
                "Access-Control-Allow-Origin",
                "Access-Control-Allow-Credentials",
                "Authorization",
                "Content-Disposition"
        ));

        // Permitir credenciales
        configuration.setAllowCredentials(true);

        // Tiempo de cache para preflight (1 hora)
        configuration.setMaxAge(3600L);

        // Aplicar configuración a todas las rutas
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
