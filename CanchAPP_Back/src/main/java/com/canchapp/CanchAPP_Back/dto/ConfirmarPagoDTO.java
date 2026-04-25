package com.canchapp.CanchAPP_Back.dto;

import lombok.Data;

@Data
public class ConfirmarPagoDTO {
  private String stripePaymentId; // El código pi_...
}
