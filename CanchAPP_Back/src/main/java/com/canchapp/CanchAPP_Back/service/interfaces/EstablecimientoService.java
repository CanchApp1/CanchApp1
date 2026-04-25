package com.canchapp.CanchAPP_Back.service.interfaces;

import com.canchapp.CanchAPP_Back.dto.EstablecimientoDTO;
import java.util.List;

public interface EstablecimientoService {

  // Devolvemos las listas y objetos puros (sin el ApiResponse de Swagger)
  List<EstablecimientoDTO> obtenerTodos();
  EstablecimientoDTO obtenerPorId(Integer id);
  EstablecimientoDTO crearEstablecimiento(EstablecimientoDTO establecimientoDTO);
  EstablecimientoDTO actualizarEstablecimiento(Integer id, EstablecimientoDTO establecimientoDTO);
  Void eliminarEstablecimiento(Integer id);
  Void activarEstablecimiento(Integer id);
  String obtenerImagenUrl(Integer establecimientoId);

}
