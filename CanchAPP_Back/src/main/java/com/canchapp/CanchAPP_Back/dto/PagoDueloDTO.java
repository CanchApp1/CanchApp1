package com.canchapp.CanchAPP_Back.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class PagoDueloDTO {

  private Integer pagoDueloId;

  // IDs de relación
  private Integer dueloId;
  private Integer usuarioId;

  // Campo extra para el FrontEnd (saber quién pagó esta mitad sin hacer más consultas)
  private String nombreUsuario;

  private LocalDate fecha;
  private LocalTime horaPago;
  private BigDecimal valorPago;

  // "MITAD_CREADOR" o "MITAD_OPONENTE"
  private String conceptoPago;

  // Datos de la pasarela
  private String stripePaymentId;
  private String estadoPago;
}
