package com.canchapp.CanchAPP_Back.service.interfaces;

import com.canchapp.CanchAPP_Back.dto.ClienteFrecuenteDTO;
import com.canchapp.CanchAPP_Back.dto.HoraPicoValleDTO;
import com.canchapp.CanchAPP_Back.dto.IngresosDTO;
import com.canchapp.CanchAPP_Back.dto.ReporteOcupacionDTO;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface MetricasService {
  IngresosDTO obtenerIngresos(LocalDate fechaInicio, LocalDate fechaFin);
  ReporteOcupacionDTO obtenerTasaOcupacion(LocalDate fechaInicio, LocalDate fechaFin, DayOfWeek diaFiltro, LocalTime horaFiltro);
  List<ClienteFrecuenteDTO> obtenerClientesFrecuentes(LocalDate fechaInicio, LocalDate fechaFin);
  List<HoraPicoValleDTO> obtenerHorasPicoValle(DayOfWeek diaSemana);
}
