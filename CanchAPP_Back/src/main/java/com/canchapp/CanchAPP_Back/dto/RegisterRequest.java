package com.canchapp.CanchAPP_Back.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
  private String correo;
  private String contrasena;
  private String nombre;
  private LocalDate fechaNacimiento;
  private String numeroTelefono;
  private Integer edad;
  private String nombrePerfil;
}
