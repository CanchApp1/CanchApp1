package com.canchapp.CanchAPP_Back.controller;

import com.canchapp.CanchAPP_Back.dto.RestablecerPasswordDTO;
import com.canchapp.CanchAPP_Back.dto.SolicitudCorreoDTO;
import com.canchapp.CanchAPP_Back.dto.ValidarCodigoDTO;
import com.canchapp.CanchAPP_Back.service.interfaces.AuthServicePasswod;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/api/auth/password")
@RequiredArgsConstructor
public class AuthControllerPassword {
  private final AuthServicePasswod authService;

  @PostMapping("/solicitar")
  public ResponseEntity<String> solicitarRecuperacion(@RequestBody SolicitudCorreoDTO dto) {
    authService.solicitarRecuperacion(dto);
    // Siempre devolvemos el mismo mensaje por seguridad (Prevención de enumeración)
    return ResponseEntity.ok("Si el correo existe en nuestro sistema, hemos enviado un código de recuperación.");
  }

  @PostMapping("/validar")
  public ResponseEntity<Boolean> validarCodigo(@RequestBody ValidarCodigoDTO dto) {
    boolean esValido = authService.validarCodigo(dto);
    return ResponseEntity.ok(esValido);
  }

  @PostMapping("/restablecer")
  public ResponseEntity<String> restablecerPassword(@RequestBody RestablecerPasswordDTO dto) {
    authService.restablecerPassword(dto);
    return ResponseEntity.ok("Contraseña restablecida exitosamente.");
  }
}
