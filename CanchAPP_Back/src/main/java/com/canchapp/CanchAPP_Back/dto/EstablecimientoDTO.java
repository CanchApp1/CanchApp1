package com.canchapp.CanchAPP_Back.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstablecimientoDTO {
  @Builder.Default
  private Boolean estado = true;

  @Builder.Default
  private LocalDateTime fechaCreacion = LocalDateTime.now();
  private Integer establecimientoId;
  private UsuarioDTO usuario;
  private String nombreEstablecimiento;
  private String direccion;
  private String numeroTelefono;
  private String imagenUrl;
  private String usuarioModificacion;
}
