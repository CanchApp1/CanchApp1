package com.canchapp.CanchAPP_Back.dto;

import lombok.Data;

@Data
public class PagoResponseDTO {
  private String clientSecret;
  private String stripePaymentId;
  private Integer pagoId;
}
