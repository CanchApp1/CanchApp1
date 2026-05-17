package com.canchapp.CanchAPP_Back.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
public class DueloDTO {
  private Integer dueloId;

  // Datos para crear el duelo
  private Integer canchaId;
  private LocalDate fecha;
  private LocalTime horaInicio;
  private LocalTime horaFin;
  private String descripcion;

  // envía el FrontEnd tras cobrar el 50%
  private String stripePaymentId;

  private List<PagoDueloDTO> pagosAsociados;
  // Datos de respuesta
  private Integer creadorId;
  private String nombreCreador;
  private String estadoDuelo;
  private LocalDateTime fechaFinBloqueoCancha;
  private LocalDateTime fechaExpiracionDuelo;
}
