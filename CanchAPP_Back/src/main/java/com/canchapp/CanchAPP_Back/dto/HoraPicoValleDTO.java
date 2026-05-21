package com.canchapp.CanchAPP_Back.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HoraPicoValleDTO {
  private String hora;            // Cambiado a String ("HH:mm") para evitar errores de formato en JSON
  private long totalReservas;
  private long capacidadMaxima;
  private double porcentajeOcupacion;
  private String estadoHorario;
}
