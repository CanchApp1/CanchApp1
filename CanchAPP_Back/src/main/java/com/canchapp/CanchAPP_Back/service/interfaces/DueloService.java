package com.canchapp.CanchAPP_Back.service.interfaces;

import com.canchapp.CanchAPP_Back.dto.DueloDTO;
import java.util.List;

public interface DueloService {

  // Crea el duelo, calcula bloqueos y registra el primer pago del 50%
  DueloDTO publicarDuelo(DueloDTO dueloDTO);

  // Obtiene todos los duelos activos para el tablero público
  List<DueloDTO> listarDuelosDisponibles();

  // Obtiene el detalle de un duelo específico incluyendo sus pagos
  DueloDTO obtenerDetalleDuelo(Integer id);

  DueloDTO aceptarDuelo(Integer idDuelo, String stripePaymentId);
}
