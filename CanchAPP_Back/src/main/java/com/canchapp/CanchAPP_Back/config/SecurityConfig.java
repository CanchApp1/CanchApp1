package com.canchapp.CanchAPP_Back.config;

import com.canchapp.CanchAPP_Back.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

// IMPORTACIONES NUEVAS PARA CORS
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

  private final AuthenticationProvider authenticationProvider;
  private final JwtAuthenticationFilter jwtAuthFilter;

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http
            // 1. ¡NUEVA LÍNEA! Activamos la configuración CORS que definimos abajo
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authRequest ->
                    authRequest
                            // 2. CORRECCIÓN VITAL: Tu React apuntaba a /v1/api/auth, así que debemos permitir esa ruta completa
                            .requestMatchers(HttpMethod.GET, "/v1/api/establecimiento").permitAll()
                            .requestMatchers(HttpMethod.POST, "/v1/api/establecimiento").permitAll()
                            .requestMatchers("/v1/api/auth/password/**").permitAll()
                            .requestMatchers("/v1/api/auth/**", "/auth/**").permitAll()
                            .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                            .requestMatchers("/error").permitAll()
                            .anyRequest().authenticated()
            )
            .sessionManagement(sessionManager ->
                    sessionManager.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .build();

  }

  // 3. ¡EL NUEVO BEAN DE CORS! Aquí le abrimos la puerta a tu React (puerto 5173)
  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();

    // Permite que tu frontend de Vite se conecte sin ser bloqueado
    configuration.setAllowedOrigins(List.of(
    "http://localhost:5173",        // Vite dev
    "http://localhost:80",      
    "http://localhost:3101",         
    "http://localhost",             // Nginx local (sin puerto)
    "https://nzf80hm5-3101.use2.devtunnels.ms"  // ← tu devtunnel
));

    // Permite todos los métodos HTTP que vas a usar, incluyendo OPTIONS que hace el preflight
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

    // Permite enviar las cabeceras con el Token JWT y JSON
    configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
    configuration.setExposedHeaders(List.of("Authorization"));
    configuration.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    // Aplica estas reglas a todas las rutas de tu backend
    source.registerCorsConfiguration("/**", configuration);

    return source;
  }

}
