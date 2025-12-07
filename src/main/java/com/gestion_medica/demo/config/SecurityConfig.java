package com.gestion_medica.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                // IMPORTANTE: Permitir acceso a TODOS los recursos estáticos
                .requestMatchers(
                        "/",
                        "/login",
                        "/usuarios/registro",
                        "/usuarios/registrar",
                        "/css/**", // CSS
                        "/js/**", // JavaScript
                        "/images/**", // Imágenes
                        "/static/**", // Ruta alternativa para recursos
                        "/*.css", // CSS en raíz
                        "/*.js", // JS en raíz
                        "/webjars/**", // Librerías web
                        "/favicon.ico", // Icono
                        "/error" // Página de error
                ).permitAll()
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
