package com.canchapp.CanchAPP_Back.service.interfaces;

import com.canchapp.CanchAPP_Back.dto.ReservaDTO;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ReservaService {

  // El método central para guardar la reserva
  ReservaDTO crearReserva(ReservaDTO reservaDTO);

  //Para el primer combo box
  List<LocalTime> obtenerHorasDisponiblesParaInicio(Integer canchaId, LocalDate fecha);

  //Para el segundo combo box
  List<LocalTime> obtenerHorasDisponiblesParaFin(Integer canchaId, LocalDate fecha, LocalTime horaInicio);

  List<ReservaDTO> obtenerPorEstablecimiento(Integer establecimientoId);
  ReservaDTO actualizarReserva(Integer id, ReservaDTO reservaDTO);

  // Obtener historial de reservas de un usuario
  List<ReservaDTO> obtenerHistorialPorUsuario(Integer idUsuario);
}
