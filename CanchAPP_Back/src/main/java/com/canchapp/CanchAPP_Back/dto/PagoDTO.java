package com.canchapp.CanchAPP_Back.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class PagoDTO {
  private Integer pagoId;
  private Integer reservaId;
  private String nombreUsuario; // Útil para que el front muestre quién pagó
  private String nombreCancha;  // Útil para saber qué pagó
  private LocalDate fecha;
  private LocalTime horaPago;
  private BigDecimal valorPago;
  private String estadoPago;
  private String stripePaymentId;
}
