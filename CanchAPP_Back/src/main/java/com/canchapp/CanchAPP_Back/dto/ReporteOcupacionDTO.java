package com.canchapp.CanchAPP_Back.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class ReporteOcupacionDTO {
  private LocalDate fechaInicioConsulta;
  private LocalDate fechaFinConsulta;
  private List<OcupacionSlotDTO> reporteOcupacion;
}
