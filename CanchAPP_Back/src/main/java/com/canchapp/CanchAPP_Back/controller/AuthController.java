package com.canchapp.CanchAPP_Back.controller;
import com.canchapp.CanchAPP_Back.dto.AuthResponse;
import com.canchapp.CanchAPP_Back.dto.LoginRequest;
import com.canchapp.CanchAPP_Back.dto.RegisterRequest;
import com.canchapp.CanchAPP_Back.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/api/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;

  @PostMapping("/login")
  public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
    return ResponseEntity.ok(authService.login(request));
  }

  @PostMapping("/register")
  public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
    return ResponseEntity.ok(authService.register(request));
  }
}
