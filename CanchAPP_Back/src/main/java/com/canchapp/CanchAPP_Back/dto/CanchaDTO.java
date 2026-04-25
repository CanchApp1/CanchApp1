package com.canchapp.CanchAPP_Back.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CanchaDTO {

  private Integer canchaId;


  private EstablecimientoDTO establecimiento;

  private String codigo;
  private String estado;
  private Double precioPorHora;

  private Boolean estadoActivo;
  private LocalDateTime fechaCreacion;
  private String usuarioCreacion;
  private LocalDateTime fechaModificacion;
  private String usuarioModificacion;
}
