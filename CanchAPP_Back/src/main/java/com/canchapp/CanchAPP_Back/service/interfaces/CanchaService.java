package com.canchapp.CanchAPP_Back.service.interfaces;
import com.canchapp.CanchAPP_Back.dto.CanchaDTO;

import java.util.List;

public interface CanchaService {

  List<CanchaDTO> obtenerTodos();
  CanchaDTO obtenerPorId(Integer id);
  CanchaDTO crearCancha(CanchaDTO canchaDTO);
  CanchaDTO actualizarCancha(Integer id, CanchaDTO canchaDTO);
  Void eliminarCancha(Integer id);
  Void activarCancha(Integer id);
  List<CanchaDTO> obtenerPorEstablecimiento(Integer establecimientoId);

}
