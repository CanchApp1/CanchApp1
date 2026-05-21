package com.canchapp.CanchAPP_Back.service.implement;

import com.canchapp.CanchAPP_Back.dto.*;
import com.canchapp.CanchAPP_Back.model.Reserva;
import com.canchapp.CanchAPP_Back.model.Usuario;
import com.canchapp.CanchAPP_Back.repository.*;
import com.canchapp.CanchAPP_Back.service.interfaces.MetricasService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MetricasServiceImpl implements MetricasService {
  private final PagoRepository pagoRepository;
  private final PagoDueloRepository pagoDueloRepository;
  private final UsuarioRepository usuarioRepository;
  private final CanchaRepository canchaRepository;
  private final ReservaRepository reservaRepository;

  @Override
  public IngresosDTO obtenerIngresos(LocalDate fechaInicio, LocalDate fechaFin) {
    // 1. Obtener el propietario desde el token JWT
    String correoPropietario = SecurityContextHolder.getContext().getAuthentication().getName();
    Usuario propietario = usuarioRepository.findByCorreo(correoPropietario)
      .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

    // 2. Lógica de fechas (El cliente manda)
    if (fechaInicio == null) {
      fechaInicio = propietario.getFechaCreacion() != null ?
        propietario.getFechaCreacion().toLocalDate() : LocalDate.of(2024, 1, 1);
    }

    if (fechaFin == null) {
      fechaFin = LocalDate.now();
    }

    if (fechaInicio.isAfter(fechaFin)) {
      throw new RuntimeException("La fecha de inicio no puede ser mayor a la fecha de fin");
    }

    // 3. Consultas a la base de datos (Unificando los pagos de la pasarela)
    BigDecimal totalReservas = pagoRepository.sumarIngresosReservasPorPropietarioYRango(correoPropietario, fechaInicio, fechaFin);
    BigDecimal totalDuelos = pagoDueloRepository.sumarIngresosDuelosPorPropietarioYRango(correoPropietario, fechaInicio, fechaFin);

    // 4. Métrica unificada
    BigDecimal totalGeneral = totalReservas.add(totalDuelos);

    return IngresosDTO.builder()
      .fechaInicioConsulta(fechaInicio)
      .fechaFinConsulta(fechaFin)
      .totalIngresos(totalGeneral)
      .ingresosReservas(totalReservas)
      .ingresosDuelos(totalDuelos)
      .build();
  }

  @Override
  public ReporteOcupacionDTO obtenerTasaOcupacion(LocalDate fechaInicio, LocalDate fechaFin, DayOfWeek diaFiltro, LocalTime horaFiltro) {
    // 1. Obtener propietario desde JWT de forma segura
    String correoPropietario = SecurityContextHolder.getContext().getAuthentication().getName();
    Usuario propietario = usuarioRepository.findByCorreo(correoPropietario)
      .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

    // 2. Control de fechas (si vienen nulas, por defecto desde la creación de cuenta hasta hoy)
    if (fechaInicio == null) {
      fechaInicio = propietario.getFechaCreacion() != null ?
        propietario.getFechaCreacion().toLocalDate() : LocalDate.of(2024, 1, 1);
    }
    if (fechaFin == null) {
      fechaFin = LocalDate.now();
    }
    if (fechaInicio.isAfter(fechaFin)) {
      throw new RuntimeException("La fecha de inicio no puede ser mayor a la fecha de fin");
    }

    // 3. Calcular cuántas veces cae cada día de la semana en este rango de fechas
    Map<DayOfWeek, Long> conteoDiasSemana = new HashMap<>();
    for (DayOfWeek d : DayOfWeek.values()) {
      conteoDiasSemana.put(d, 0L);
    }
    LocalDate fechaAux = fechaInicio;
    while (!fechaAux.isAfter(fechaFin)) {
      DayOfWeek dow = fechaAux.getDayOfWeek();
      conteoDiasSemana.put(dow, conteoDiasSemana.get(dow) + 1);
      fechaAux = fechaAux.plusDays(1);
    }

    // 4. Obtener cantidad de canchas activas del propietario
    long totalCanchas = canchaRepository.contarCanchasActivasPorPropietario(correoPropietario);
    if (totalCanchas == 0) {
      return ReporteOcupacionDTO.builder()
        .fechaInicioConsulta(fechaInicio)
        .fechaFinConsulta(fechaFin)
        .reporteOcupacion(new ArrayList<>())
        .build();
    }

    // 5. Traer todas las reservas confirmadas del periodo
    List<Reserva> reservas = reservaRepository.buscarReservasParaOcupacion(correoPropietario, fechaInicio, fechaFin);

    //bloque debug
    System.out.println("debug de metricas");
    System.out.println("1. Propietario buscando: " + correoPropietario);
    System.out.println("2. Total de reservas devueltas: " + reservas.size());

    for (Reserva r : reservas) {
      System.out.println("ID: " + r.getReservaId() +
        "EstadoReserva: [" + r.getEstadoReserva() + "]" +
        "EstadoActivo: [" + r.getEstadoActivo() + "]");
    }

    // 6. Generar la matriz completa de slots de tiempo y calcular ocupación por intervalos puros
    List<OcupacionSlotDTO> todosLosSlots = new ArrayList<>();

    for (DayOfWeek dia : DayOfWeek.values()) {
      for (int h = 6; h <= 23; h++) { // Rango operativo de 6 AM a 11 PM
        LocalTime horaSlot = LocalTime.of(h, 0);

        // Contar cuántas reservas de la lista caen dentro de este slot de hora exacto
        long reservasEnSlot = 0;
        for (Reserva r : reservas) {
          // 1. Validar que coincida el mismo día de la semana
          if (r.getFecha().getDayOfWeek() == dia) {
            LocalTime inicio = r.getHoraInicio();
            LocalTime fin = r.getHoraFin();

            // 2. Lógica de intervalos: El slot está ocupado si: inicio <= horaSlot < fin
            // Ejemplo: Reserva de 15:00 a 16:00. El slot 15:00 entra perfectamente.
            if ((horaSlot.isAfter(inicio) || horaSlot.equals(inicio)) && horaSlot.isBefore(fin)) {
              reservasEnSlot++;
            }
          }
        }

        long diasRepetidos = conteoDiasSemana.get(dia);
        long capacidadMaxima = totalCanchas * diasRepetidos;

        double porcentaje = capacidadMaxima > 0 ? ((double) reservasEnSlot / capacidadMaxima) * 100 : 0.0;
        porcentaje = Math.round(porcentaje * 100.0) / 100.0; // Redondear a 2 decimales

        todosLosSlots.add(OcupacionSlotDTO.builder()
          .diaSemana(dia)
          .horaSlot(horaSlot)
          .totalReservasEnSlot(reservasEnSlot)
          .capacidadMaximaSlot(capacidadMaxima)
          .porcentajeOcupacion(porcentaje)
          .build());
      }
    }

    // 7. Aplicar filtros específicos si el propietario los mandó desde el frontend
    if (diaFiltro != null) {
      todosLosSlots = todosLosSlots.stream()
        .filter(s -> s.getDiaSemana() == diaFiltro)
        .collect(Collectors.toList());
    }
    if (horaFiltro != null) {
      final LocalTime horaFiltroFinal = LocalTime.of(horaFiltro.getHour(), 0); // Normalizar a la hora en punto
      todosLosSlots = todosLosSlots.stream()
        .filter(s -> s.getHoraSlot().equals(horaFiltroFinal))
        .collect(Collectors.toList());
    }

    return ReporteOcupacionDTO.builder()
      .fechaInicioConsulta(fechaInicio)
      .fechaFinConsulta(fechaFin)
      .reporteOcupacion(todosLosSlots)
      .build();
  }

  @Override
  public List<ClienteFrecuenteDTO> obtenerClientesFrecuentes(LocalDate fechaInicio, LocalDate fechaFin) {
    // 1. Obtener propietario desde el token JWT
    String correoPropietario = SecurityContextHolder.getContext().getAuthentication().getName();
    Usuario propietario = usuarioRepository.findByCorreo(correoPropietario)
      .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

    // 2. Control de fechas por defecto (igual que en los otros endpoints)
    if (fechaInicio == null) {
      fechaInicio = propietario.getFechaCreacion() != null ?
        propietario.getFechaCreacion().toLocalDate() : LocalDate.of(2024, 1, 1);
    }
    if (fechaFin == null) {
      fechaFin = LocalDate.now();
    }
    if (fechaInicio.isAfter(fechaFin)) {
      throw new RuntimeException("La fecha de inicio no puede ser mayor a la fecha de fin");
    }

    // 3. Consultar las reservas en la BD (excluyendo al dueño)
    List<Reserva> reservas = reservaRepository.buscarReservasParaClientesFrecuentes(correoPropietario, fechaInicio, fechaFin);

    // 4. Agrupar por Cliente y por Mes usando una clave compuesta en Streams
    Map<String, Long> conteoClientesPorMes = reservas.stream()
      .collect(Collectors.groupingBy(r -> {
        // Generamos una clave única: id_nombre_correo_Año-Mes
        String mesAnioStr = r.getFecha().getYear() + "-" + String.format("%02d", r.getFecha().getMonthValue());
        return r.getUsuario().getUsuarioId() + "||" +
          r.getUsuario().getNombre() + "||" +
          r.getUsuario().getCorreo() + "||" +
          mesAnioStr;
      }, Collectors.counting()));

    // 5. Transformar el mapa resultante a la lista de DTOs y ordenar de mayor a menor
    return conteoClientesPorMes.entrySet().stream()
      .map(entry -> {
        String[] datos = entry.getKey().split("\\|\\|");
        return ClienteFrecuenteDTO.builder()
          .usuarioId(Integer.parseInt(datos[0]))
          .nombreCliente(datos[1])
          .correoCliente(datos[2])
          .mesAnio(datos[3])
          .totalReservas(entry.getValue())
          .build();
      })
      // Ordenar por totalReservas de forma descendente (los más frecuentes primero)
      .sorted((c1, c2) -> c2.getTotalReservas().compareTo(c1.getTotalReservas()))
      .collect(Collectors.toList());
  }

  @Override
  public List<HoraPicoValleDTO> obtenerHorasPicoValle(DayOfWeek diaSemana) {
    // 1. Obtener propietario desde JWT de forma segura
    String correoPropietario = SecurityContextHolder.getContext().getAuthentication().getName();
    Usuario propietario = usuarioRepository.findByCorreo(correoPropietario)
      .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

    // 2. CÁLCULO INTERNO DE FECHAS: Desde que se creó el negocio hasta hoy de forma automática
    LocalDate fechaInicio = propietario.getFechaCreacion() != null ?
      propietario.getFechaCreacion().toLocalDate() : LocalDate.of(2024, 1, 1);
    LocalDate fechaFin = LocalDate.now();

    // 3. Contar cuántas veces ha transcurrido ese día de la semana en el histórico del negocio
    long conteoDiaEspecifico = 0;
    LocalDate fechaAux = fechaInicio;
    while (!fechaAux.isAfter(fechaFin)) {
      if (fechaAux.getDayOfWeek() == diaSemana) {
        conteoDiaEspecifico++;
      }
      fechaAux = fechaAux.plusDays(1);
    }

    // 4. Obtener canchas activas
    long totalCanchas = canchaRepository.contarCanchasActivasPorPropietario(correoPropietario);
    if (totalCanchas == 0 || conteoDiaEspecifico == 0) {
      return new ArrayList<>();
    }

    // 5. EJECUTAR QUERY EN POSTGRES
    // diaSemana.getValue() devuelve 1 para lunes y 7 para domingo, idéntico al ISODOW de Postgres
    int diaSemanaIdx = diaSemana.getValue();
    List<Object[]> filasEstatisticas = reservaRepository.contarReservasPorHoraYDiaPostgreSQL(
      correoPropietario, fechaInicio, fechaFin, diaSemanaIdx);

    List<HoraPicoValleDTO> resultado = new ArrayList<>();
    long capacidadMaximaSlot = totalCanchas * conteoDiaEspecifico;

    // 6. Mapear la respuesta agregada por la Base de Datos
    for (Object[] fila : filasEstatisticas) {
      int horaInt = ((Number) fila[0]).intValue();
      long reservasEnSlot = ((Number) fila[1]).longValue();

      double porcentaje = capacidadMaximaSlot > 0 ? ((double) reservasEnSlot / capacidadMaximaSlot) * 100 : 0.0;
      porcentaje = Math.round(porcentaje * 100.0) / 100.0;

      String estadoHorario = "NORMAL";
      if (porcentaje >= 55.0) {
        estadoHorario = "PICO";
      } else if (porcentaje <= 15.0) {
        estadoHorario = "VALLE";
      }

      String horaFormateada = String.format("%02d:00", horaInt);

      resultado.add(HoraPicoValleDTO.builder()
        .hora(horaFormateada)
        .totalReservas(reservasEnSlot)
        .capacidadMaxima(capacidadMaximaSlot)
        .porcentajeOcupacion(porcentaje)
        .estadoHorario(estadoHorario)
        .build());
    }

    return resultado;
  }

}
