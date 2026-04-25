package com.canchapp.CanchAPP_Back.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservaDTO {

  private Integer reservaId;

  // Necesitamos saber quién reserva y qué reserva
  private UsuarioDTO usuario;
  private CanchaDTO cancha;

  private LocalDate fecha;
  private LocalTime horaInicio;
  private LocalTime horaFin;
  private String descripcion;

  private String estadoReserva;

  // Auditoría
  private Boolean estadoActivo;
  private LocalDateTime fechaCreacion;
  private String usuarioCreacion;
  private LocalDateTime fechaModificacion;
  private String usuarioModificacion;
}
