package com.canchapp.CanchAPP_Back.dto;

import lombok.Builder;
import lombok.Data;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Data
@Builder
public class OcupacionSlotDTO {
  private DayOfWeek diaSemana;        // MONDAY, TUESDAY...
  private LocalTime horaSlot;         // 14:00:00
  private long totalReservasEnSlot;   // Cuántas veces se alquiló en este horario
  private long capacidadMaximaSlot;   // Cuántas veces se pudo haber alquilado en total
  private double porcentajeOcupacion;
}
