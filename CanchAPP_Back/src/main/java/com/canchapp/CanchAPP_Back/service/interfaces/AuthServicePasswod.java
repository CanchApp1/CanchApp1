package com.canchapp.CanchAPP_Back.service.interfaces;

import com.canchapp.CanchAPP_Back.dto.RestablecerPasswordDTO;
import com.canchapp.CanchAPP_Back.dto.SolicitudCorreoDTO;
import com.canchapp.CanchAPP_Back.dto.ValidarCodigoDTO;

public interface AuthServicePasswod {
  void solicitarRecuperacion(SolicitudCorreoDTO dto);
  boolean validarCodigo(ValidarCodigoDTO dto);
  void restablecerPassword(RestablecerPasswordDTO dto);
}
