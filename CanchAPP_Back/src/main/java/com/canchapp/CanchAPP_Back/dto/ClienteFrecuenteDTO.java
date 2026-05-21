package com.canchapp.CanchAPP_Back.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ClienteFrecuenteDTO {
  private Integer usuarioId;
  private String nombreCliente;
  private String correoCliente;
  private String mesAnio; // Ejemplo: "2026-05" o "Mayo 2026"
  private Long totalReservas;
}
