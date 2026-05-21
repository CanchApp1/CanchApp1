package com.canchapp.CanchAPP_Back.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class IngresosDTO {
  private LocalDate fechaInicioConsulta;
  private LocalDate fechaFinConsulta;

  private BigDecimal totalIngresos;

  private BigDecimal ingresosReservas;
  private BigDecimal ingresosDuelos;

}
