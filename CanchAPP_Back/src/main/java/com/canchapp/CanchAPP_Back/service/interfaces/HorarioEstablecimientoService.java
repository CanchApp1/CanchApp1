package com.canchapp.CanchAPP_Back.service.interfaces;

import com.canchapp.CanchAPP_Back.dto.HorarioEstablecimientoDTO;

import java.util.List;

public interface HorarioEstablecimientoService {
  List<HorarioEstablecimientoDTO> obtenerPorEstablecimiento(Integer establecimientoId);
  HorarioEstablecimientoDTO crearHorario(HorarioEstablecimientoDTO horarioDTO);
  HorarioEstablecimientoDTO actualizarHorario(Integer id, HorarioEstablecimientoDTO horarioDTO);
  Void eliminarHorario(Integer id);
}
