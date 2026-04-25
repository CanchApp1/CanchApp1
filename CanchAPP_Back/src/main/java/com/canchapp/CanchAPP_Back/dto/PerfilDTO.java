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
public class PerfilDTO {

  @Builder.Default
  private Boolean estado = true;

  @Builder.Default
  private LocalDateTime fechaCreacion = LocalDateTime.now();

  private Integer perfilId;
  private String codigo;
  private String nombre;
  private String usuarioCreacion;
  private LocalDateTime fechaModificacion;
  private String usuarioModificacion;
}

