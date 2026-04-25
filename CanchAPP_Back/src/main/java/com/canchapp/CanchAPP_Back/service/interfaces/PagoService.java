package com.canchapp.CanchAPP_Back.service.interfaces;

import com.canchapp.CanchAPP_Back.dto.PagoDTO;
import com.canchapp.CanchAPP_Back.dto.PagoResponseDTO;

import java.util.List;

public interface PagoService {
//Método para iniciar el pago con Stripe
  PagoResponseDTO crearIntencionPago(Integer reservaId) throws Exception;

  String confirmarPago(String stripePaymentId) throws Exception;

  List<PagoDTO> listarTodos();
  List<PagoDTO> listarPorUsuario(Integer usuarioId);
  List<PagoDTO> listarPorEstablecimiento(Integer establecimientoId);
}
