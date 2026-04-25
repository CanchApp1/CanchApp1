package com.canchapp.CanchAPP_Back.service.interfaces;

import com.canchapp.CanchAPP_Back.dto.UsuarioDTO;

import java.util.List;

public interface UsuarioService {
  UsuarioDTO actualizarMiPerfil(UsuarioDTO usuarioDTO);
  List<UsuarioDTO> listarJugadores();
  UsuarioDTO obtenerUsuarioPorId(Integer id);
  UsuarioDTO obtenerMiPerfil();
}
