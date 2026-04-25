package com.canchapp.CanchAPP_Back.service.implement;

import com.canchapp.CanchAPP_Back.dto.RestablecerPasswordDTO;
import com.canchapp.CanchAPP_Back.dto.SolicitudCorreoDTO;
import com.canchapp.CanchAPP_Back.dto.ValidarCodigoDTO;
import com.canchapp.CanchAPP_Back.model.RecuperacionPassword;
import com.canchapp.CanchAPP_Back.model.Usuario;
import com.canchapp.CanchAPP_Back.repository.RecuperacionPasswordRepository;
import com.canchapp.CanchAPP_Back.repository.UsuarioRepository;
import com.canchapp.CanchAPP_Back.service.interfaces.AuthServicePasswod;
import com.canchapp.CanchAPP_Back.service.interfaces.EmailService;
import com.canchapp.CanchAPP_Back.util.UtilidadSeguridad;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthPwtServiceImpl implements AuthServicePasswod {

  private final UsuarioRepository usuarioRepository;
  private final RecuperacionPasswordRepository recuperacionPasswordRepository;
  private final EmailService emailService;
  private final PasswordEncoder passwordEncoder;

  @Override
  @Transactional
  public void solicitarRecuperacion(SolicitudCorreoDTO dto) {
    Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreo(dto.getCorreo());
    if (usuarioOpt.isEmpty()) return;

    Usuario usuario = usuarioOpt.get();

    // Invalidar códigos viejos
    List<RecuperacionPassword> codigosViejos = recuperacionPasswordRepository.findByUsuario_UsuarioIdAndUsadoFalse(usuario.getUsuarioId());
    for (RecuperacionPassword cod : codigosViejos) {
      cod.setUsado(true);
    }
    recuperacionPasswordRepository.saveAll(codigosViejos);

    // Generar código plano (Para enviarlo por correo)
    String codigoPlano = UtilidadSeguridad.generarCodigo6Digitos();

    // Hashear código (Para guardarlo en BD)
    String codigoHasheado = passwordEncoder.encode(codigoPlano);

    RecuperacionPassword nuevaRecuperacion = RecuperacionPassword.builder()
      .usuario(usuario)
      .codigo(codigoHasheado) // ¡GUARDAMOS EL HASH, NO EL TEXTO PLANO!
      .fechaExpiracion(LocalDateTime.now().plusMinutes(15))
      .usado(false)
      .intentos(0)
      .build();

    recuperacionPasswordRepository.save(nuevaRecuperacion);

    // Enviamos el código PLANO al correo
    emailService.enviarCorreoRecuperacion(usuario.getCorreo(), codigoPlano);
  }

  @Override
  @Transactional
  public boolean validarCodigo(ValidarCodigoDTO dto) {
    Usuario usuario = usuarioRepository.findByCorreo(dto.getCorreo())
      .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

    // Buscamos el código activo del usuario
    RecuperacionPassword recuperacion = recuperacionPasswordRepository
      .findFirstByUsuario_UsuarioIdAndUsadoFalseOrderByFechaExpiracionDesc(usuario.getUsuarioId())
      .orElseThrow(() -> new RuntimeException("No hay códigos de recuperación activos para este usuario"));

    // Validamos límite de intentos (prevención de fuerza bruta)
    if (recuperacion.getIntentos() >= 3) {
      recuperacion.setUsado(true);
      recuperacionPasswordRepository.save(recuperacion);
      throw new RuntimeException("Demasiados intentos fallidos. Solicite un nuevo código.");
    }

    // COMPROBACIÓN CRIPTOGRÁFICA
    if (!passwordEncoder.matches(dto.getCodigo(), recuperacion.getCodigo())) {
      // Sumamos un intento fallido
      recuperacion.setIntentos(recuperacion.getIntentos() + 1);
      recuperacionPasswordRepository.save(recuperacion);
      throw new RuntimeException("Código inválido");
    }

    // Validar expiración
    if (recuperacion.getFechaExpiracion().isBefore(LocalDateTime.now())) {
      recuperacion.setUsado(true);
      recuperacionPasswordRepository.save(recuperacion);
      throw new RuntimeException("El código ha expirado. Solicite uno nuevo.");
    }

    return true;
  }

  @Override
  @Transactional
  public void restablecerPassword(RestablecerPasswordDTO dto) {
    ValidarCodigoDTO validacionDTO = new ValidarCodigoDTO();
    validacionDTO.setCorreo(dto.getCorreo());
    validacionDTO.setCodigo(dto.getCodigo());

    if (validarCodigo(validacionDTO)) {
      Usuario usuario = usuarioRepository.findByCorreo(dto.getCorreo()).get();
      usuario.setContrasena(passwordEncoder.encode(dto.getNuevaContrasena()));
      usuarioRepository.save(usuario);

      // Quemar el código activo
      RecuperacionPassword recuperacion = recuperacionPasswordRepository
        .findFirstByUsuario_UsuarioIdAndUsadoFalseOrderByFechaExpiracionDesc(usuario.getUsuarioId()).get();
      recuperacion.setUsado(true);
      recuperacionPasswordRepository.save(recuperacion);
    }
  }
}
