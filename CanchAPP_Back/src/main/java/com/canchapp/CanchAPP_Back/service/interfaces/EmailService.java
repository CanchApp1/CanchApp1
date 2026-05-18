package com.canchapp.CanchAPP_Back.service.interfaces;

public interface EmailService {
  void enviarCorreoRecuperacion(String destinatario, String codigo);

  void enviarCorreoConfirmacionDuelo(String destinatario, String asunto, String mensaje);
}
