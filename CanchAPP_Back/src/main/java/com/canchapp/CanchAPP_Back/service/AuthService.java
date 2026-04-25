package com.canchapp.CanchAPP_Back.service;

import com.canchapp.CanchAPP_Back.dto.AuthResponse;
import com.canchapp.CanchAPP_Back.dto.LoginRequest;
import com.canchapp.CanchAPP_Back.dto.RegisterRequest;
import com.canchapp.CanchAPP_Back.model.Perfil;
import com.canchapp.CanchAPP_Back.model.Usuario;
import com.canchapp.CanchAPP_Back.repository.PerfilRepository;
import com.canchapp.CanchAPP_Back.repository.UsuarioRepository;
import com.canchapp.CanchAPP_Back.security.JwtService; // <-- Asegúrate de que importe el de 'security'
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

  private final UsuarioRepository usuarioRepository;
  private final PerfilRepository perfilRepository;
  private final JwtService jwtService;
  private final PasswordEncoder passwordEncoder;
  private final AuthenticationManager authenticationManager;

  public AuthResponse login(LoginRequest request) {
    authenticationManager.authenticate(
      new UsernamePasswordAuthenticationToken(request.getCorreo(), request.getContrasena())
    );

    Usuario user = usuarioRepository.findByCorreo(request.getCorreo()).orElseThrow();
    String token = jwtService.generateToken(user);

    return AuthResponse.builder().token(token).build();
  }

  public AuthResponse register(RegisterRequest request) {
    Perfil perfil = perfilRepository.findByNombre("Jugador")
      .orElseThrow(() -> new RuntimeException("Error crítico: El perfil 'Jugador' no está configurado en la base de datos"));

    Usuario usuario = Usuario.builder()
      .correo(request.getCorreo())
      .contrasena(passwordEncoder.encode(request.getContrasena()))
      .nombre(request.getNombre())
      .fechaNacimiento(request.getFechaNacimiento())
      .numeroTelefono(request.getNumeroTelefono())
      .edad(request.getEdad())
      .perfil(perfil)
      .estado(true)
      .fechaCreacion(LocalDateTime.now())
      .usuarioCreacion("SISTEMA_REGISTRO")
      .build();

    usuarioRepository.save(usuario);

    // USAMOS EL MÉTODO DEL JWTSERVICE ORIGINAL
    return AuthResponse.builder()
      .token(jwtService.generateToken(usuario))
      .build();
  }
}
