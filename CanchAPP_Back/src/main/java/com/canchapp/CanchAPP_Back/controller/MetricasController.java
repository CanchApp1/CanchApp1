package com.canchapp.CanchAPP_Back.controller;

import com.canchapp.CanchAPP_Back.dto.*;
import com.canchapp.CanchAPP_Back.service.interfaces.MetricasService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/v1/api/metricas")
@Tag(name = "Métricas Controller", description = "Dashboard financiero para propietarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MetricasController {

  private final MetricasService metricasService;
  private final ResponseService responseService;

  @GetMapping("/ingresos")
  @Operation(summary = "Obtener ingresos totales", description = "Suma ingresos de reservas y duelos. Filtrado por rango de fechas (YYYY-MM-DD).")
  public ResponseEntity<IngresosDTO> obtenerIngresos(
    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {

    IngresosDTO ingresos = metricasService.obtenerIngresos(fechaInicio, fechaFin);
    return new ResponseEntity<>(ingresos, HttpStatus.OK);
  }

  @GetMapping("/ocupacion")
  @Operation(
    summary = "Obtener tasa de ocupación de las canchas",
    description = "Calcula el porcentaje de ocupación agrupado por día de la semana y hora. Permite filtros opcionales."
  )
  public ResponseEntity<ReporteOcupacionDTO> obtenerTasaOcupacion(
    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
    @RequestParam(required = false, name = "diaSemana") String diaSemanaStr, // Cambiado a String para Swagger
    @RequestParam(required = false, name = "hora") String horaStr) {

    java.time.DayOfWeek diaFiltro = null;
    LocalTime horaLocal = null;

    // 1. Validar y parsear el Día de la Semana de forma segura
    if (diaSemanaStr != null && !diaSemanaStr.trim().isEmpty()) {
      try {
        // Convierte a mayúsculas por si envían "monday" en vez de "MONDAY"
        diaFiltro = java.time.DayOfWeek.valueOf(diaSemanaStr.trim().toUpperCase());
      } catch (IllegalArgumentException e) {
        throw new IllegalArgumentException("El día de la semana no es válido. Debe ser: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY o SUNDAY.");
      }
    }

    // 2. Validar y parsear la hora dinámicamente
    if (horaStr != null && !horaStr.trim().isEmpty()) {
      try {
        if (horaStr.length() == 8) { // Si viene "14:00:00"
          horaLocal = LocalTime.parse(horaStr.substring(0, 5));
        } else {
          horaLocal = LocalTime.parse(horaStr); // Si viene "14:00"
        }
      } catch (Exception e) {
        throw new IllegalArgumentException("El formato de hora enviado no es válido. Usa HH:mm o HH:mm:ss (Ej: 14:00)");
      }
    }

    // Invocamos el servicio con los tipos correctos (DayOfWeek y LocalTime)
    ReporteOcupacionDTO reporte = metricasService.obtenerTasaOcupacion(fechaInicio, fechaFin, diaFiltro, horaLocal);
    return new ResponseEntity<>(reporte, HttpStatus.OK);
  }

  @GetMapping("/clientes-frecuentes")
  @Operation(summary = "Los clientes que mas hacen reserva en el establecimiento dentro de la app",
    description = "Devuelve una lista de los clientes que mas reservan en la app de mayor a menor")
  public ResponseEntity<List<ClienteFrecuenteDTO>> obtenerClientesFrecuentes(
    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {

    List<ClienteFrecuenteDTO> clientes = metricasService.obtenerClientesFrecuentes(fechaInicio, fechaFin);
    return ResponseEntity.ok(clientes);
  }


  @GetMapping("/pico-valle")
  @Operation(summary = "Horas Pico y Valle por Día de la Semana", description = "Devuelve la ocupación promedio por horas filtrado únicamente por el nombre del día")
  public ResponseEntity<ApiResponse<List<HoraPicoValleDTO>>> obtenerHorasPicoValle(@RequestParam String dia) {

    DayOfWeek diaSemana;
    try {
      // Convierte "monday", "Monday" o "MONDAY" de manera segura a un Enum de Java
      diaSemana = DayOfWeek.valueOf(dia.toUpperCase());
    } catch (IllegalArgumentException e) {
      throw new RuntimeException("Día de la semana inválido. Debe ingresarlo en inglés (Ej: MONDAY, TUESDAY, etc.)");
    }

    List<HoraPicoValleDTO> reporte = metricasService.obtenerHorasPicoValle(diaSemana);
    return ResponseEntity.ok(responseService.createResponse(reporte, "retrieve"));
  }

}
