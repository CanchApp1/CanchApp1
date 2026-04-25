package com.canchapp.CanchAPP_Back.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HorarioEstablecimientoDTO {
  private Integer horarioId;

  // Anidamos el establecimiento para saber a quién pertenece esta regla
  private EstablecimientoDTO establecimiento;

  private String diaSemana;

  // Usamos LocalTime para que el JSON reciba "08:00:00"
  private LocalTime horaApertura;
  private LocalTime horaCierre;

  private Boolean cerradoTodoElDia;

  // Campos de auditoría
  private Boolean estadoActivo;
  private LocalDateTime fechaCreacion;
  private String usuarioCreacion;
  private LocalDateTime fechaModificacion;
  private String usuarioModificacion;

}
