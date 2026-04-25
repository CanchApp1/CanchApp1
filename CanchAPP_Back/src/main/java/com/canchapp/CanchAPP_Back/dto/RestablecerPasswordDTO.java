package com.canchapp.CanchAPP_Back.dto;
import lombok.Data;

@Data
public class RestablecerPasswordDTO {
  private String correo;
  private String codigo;
  private String nuevaContrasena;
}
