package com.canchapp.CanchAPP_Back.controller;

import com.canchapp.CanchAPP_Back.dto.PagoResponseDTO;
import com.canchapp.CanchAPP_Back.service.interfaces.PagoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/api/pagos")
@CrossOrigin(origins = "*") // Permite peticiones desde el FrontEnd
public class PagoController {

  @Autowired
  private PagoService pagoService;

  @PostMapping("/intent/{reservaId}")
  public ResponseEntity<?> crearIntencionPago(@PathVariable Integer reservaId) {
    try {
      PagoResponseDTO response = pagoService.crearIntencionPago(reservaId);
      return ResponseEntity.ok(response);
    } catch (Exception e) {
      return ResponseEntity.badRequest().body("Error al procesar el pago: " + e.getMessage());
    }
  }

  @PostMapping("/confirmar")
  public ResponseEntity<?> confirmarPago(@RequestBody com.canchapp.CanchAPP_Back.dto.ConfirmarPagoDTO dto) {
    try {
      String resultado = pagoService.confirmarPago(dto.getStripePaymentId());
      return ResponseEntity.ok(resultado);
    } catch (Exception e) {
      return ResponseEntity.badRequest().body("Error al confirmar el pago: " + e.getMessage());
    }
  }

  // 1. Listar TODOS los pagos (Ideal para el Super Admin del sistema)
  @GetMapping
  public ResponseEntity<java.util.List<com.canchapp.CanchAPP_Back.dto.PagoDTO>> listarTodos() {
    return ResponseEntity.ok(pagoService.listarTodos());
  }

  // 2. Listar pagos de un Juagdores
  @GetMapping("/usuario/{usuarioId}")
  public ResponseEntity<java.util.List<com.canchapp.CanchAPP_Back.dto.PagoDTO>> listarPorUsuario(@PathVariable Integer usuarioId) {
    return ResponseEntity.ok(pagoService.listarPorUsuario(usuarioId));
  }

  // 3. Listar pagos de un ESTABLECIMIENTO (Ideal para el Dashboard del Propietario)
  @GetMapping("/establecimiento/{establecimientoId}")
  public ResponseEntity<java.util.List<com.canchapp.CanchAPP_Back.dto.PagoDTO>> listarPorEstablecimiento(@PathVariable Integer establecimientoId) {
    return ResponseEntity.ok(pagoService.listarPorEstablecimiento(establecimientoId));
  }
}
