package com.gestion_medica.demo.config;

import com.gestion_medica.demo.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // 1. Eliminamos el @Autowired de campo para evitar problemas de instanciación
    // private CustomUserDetailsService userDetailsService; 
    // 2. IMPORTANTE: Hacemos este método 'static' para romper el ciclo de dependencia
    @Bean
    public static PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 3. Inyectamos el servicio y el encoder como parámetros del método
    @Bean
    public DaoAuthenticationProvider authenticationProvider(CustomUserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        // CAMBIO AQUÍ: Pasamos el userDetailsService DENTRO de los paréntesis
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);

        // Esta línea ya no es necesaria porque lo pasamos arriba, puedes borrarla o comentarla:
        // authProvider.setUserDetailsService(userDetailsService); 
        authProvider.setPasswordEncoder(passwordEncoder);

        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                // Recursos públicos
                .requestMatchers(
                        "/",
                        "/login",
                        "/usuarios/registro",
                        "/usuarios/registrar",
                        "/css/**",
                        "/js/**",
                        "/images/**",
                        "/static/**",
                        "/*.css",
                        "/*.js",
                        "/webjars/**",
                        "/favicon.ico",
                        "/error"
                ).permitAll()
                // Rutas específicas por rol
                .requestMatchers("/dashboard").authenticated()
                // Administrador
                .requestMatchers("/pacientes/**", "/empleados/**", "/departamentos/**",
                        "/sedes/**", "/reportes/**", "/usuarios/**", "/personas/**",
                        "/enfermedades/**", "/auditoria/**", "/equipamientos/**")
                .hasAnyRole("Administrador")
                // Médico
                .requestMatchers("/historias-clinicas/**", "/diagnosticos/**")
                .hasAnyRole("Medico", "Administrador")
                // Secretaria
                .requestMatchers("/pacientes/**", "/citas/**", "/personas/**")
                .hasAnyRole("Secretaria", "Administrador")
                // Técnico de Mantenimiento
                .requestMatchers("/equipamientos/**", "/equipos-departamento/**")
                .hasAnyRole("TecnicoMantenimiento", "AsistenteBodega", "Administrador")
                // Asistente de Bodega
                .requestMatchers("/medicamentos/**")
                .hasAnyRole("AsistenteBodega", "Medico", "Administrador")
                // Todo lo demás requiere autenticación
                .anyRequest().authenticated()
                )
                .formLogin(form -> form
                .loginPage("/login")
                .loginProcessingUrl("/login")
                .defaultSuccessUrl("/dashboard", true)
                .failureUrl("/login?error=true")
                .permitAll()
                )
                .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login?logout")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
                .permitAll()
                );

        return http.build();
    }
}
