package com.canchapp.CanchAPP_Back.service.implement;

import com.canchapp.CanchAPP_Back.dto.PagoDTO;
import com.canchapp.CanchAPP_Back.dto.PagoResponseDTO;
import com.canchapp.CanchAPP_Back.model.Pago;
import com.canchapp.CanchAPP_Back.model.Reserva;
import com.canchapp.CanchAPP_Back.repository.PagoRepository;
import com.canchapp.CanchAPP_Back.repository.ReservaRepository;
//import com.canchapp.CanchAPP_Back.service.PagoService;
import com.canchapp.CanchAPP_Back.service.interfaces.PagoService;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class PagoServiceImpl implements PagoService {

  @Autowired
  private ReservaRepository reservaRepository;

  @Autowired
  private org.modelmapper.ModelMapper modelMapper;

  @Autowired
  private PagoRepository pagoRepository;

  @Override
  @Transactional
  public PagoResponseDTO crearIntencionPago(Integer reservaId) throws Exception {

    // 1. Buscamos la reserva
    Reserva reserva = reservaRepository.findById(reservaId)
      .orElseThrow(() -> new RuntimeException("Reserva no encontrada con ID: " + reservaId));

    // 2. Calculamos el valor a pagar de forma DINÁMICA
    // (Nota: Asegúrate de que los nombres de los métodos coincidan con tu modelo Reserva y Cancha)
    LocalTime horaInicio = reserva.getHoraInicio();
    LocalTime horaFin = reserva.getHoraFin();

    // Usamos Duration para saber cuántos minutos exactos reservaron (útil por si reservan 1 hora y media)
    long minutosReservados = java.time.Duration.between(horaInicio, horaFin).toMinutes();

    // Convertimos los minutos a horas (Ej: 90 minutos = 1.5 horas)
    java.math.BigDecimal horas = new java.math.BigDecimal(minutosReservados)
      .divide(new java.math.BigDecimal("60"), 2, java.math.RoundingMode.HALF_UP);

    // Obtenemos el precio por hora de esa cancha específica
    java.math.BigDecimal precioPorHora = BigDecimal.valueOf(reserva.getCancha().getPrecioPorHora());

    // Multiplicamos horas * precio
    java.math.BigDecimal valorTotal = precioPorHora.multiply(horas);

    // 3. Convertimos a centavos para Stripe (multiplicamos por 100 obligatoriamente)
    long montoEnCentavos = valorTotal.multiply(new java.math.BigDecimal("100")).longValue();

    // 4. Creamos la intención de pago en Stripe
    PaymentIntentCreateParams params =
      PaymentIntentCreateParams.builder()
        .setAmount(montoEnCentavos)
        .setCurrency("cop")
        .putMetadata("reserva_id", reservaId.toString())
        .setPaymentMethod("pm_card_visa") // Tarjeta Visa falsa de Stripe
        .setConfirm(true) // Le decimos a Stripe: "¡Cóbralo ya mismo!"
        .setReturnUrl("http://localhost:8080")
        .build();

    PaymentIntent paymentIntent = PaymentIntent.create(params);

    // 5. Guardamos en nuestra Base de Datos como PENDIENTE
    Pago nuevoPago = new Pago();
    nuevoPago.setReserva(reserva);
    nuevoPago.setUsuario(reserva.getUsuario());
    nuevoPago.setFecha(LocalDate.now());
    nuevoPago.setHoraPago(LocalTime.now());
    nuevoPago.setValorPago(valorTotal);
    nuevoPago.setStripePaymentId(paymentIntent.getId());
    nuevoPago.setEstadoPago("PENDIENTE");
    nuevoPago.setFechaCreacion(LocalDateTime.now());
    nuevoPago.setUsuarioCreacion("SISTEMA_PAGOS");

    Pago pagoGuardado = pagoRepository.save(nuevoPago);

    // 6. Devolvemos el secreto al FrontEnd
    PagoResponseDTO response = new PagoResponseDTO();
    response.setClientSecret(paymentIntent.getClientSecret());
    response.setStripePaymentId(paymentIntent.getId());
    response.setPagoId(pagoGuardado.getPagoId());

    return response;
  }

  @Override
  @Transactional
  public String confirmarPago(String stripePaymentId) throws Exception {

    // 1. Buscamos el pago en nuestra Base de Datos
    Pago pago = pagoRepository.findByStripePaymentId(stripePaymentId)
      .orElseThrow(() -> new RuntimeException("Pago no encontrado en la base de datos"));

    // 2. Consultamos directamente a Stripe el estado de esa transacción
    PaymentIntent paymentIntent = PaymentIntent.retrieve(stripePaymentId);

    // 3. Validamos el estado real del dinero
    if ("succeeded".equals(paymentIntent.getStatus())) {

      // ¡El dinero está en tu cuenta! Actualizamos la BD de Pagos
      pago.setEstadoPago("COMPLETADO");

      Reserva reservaAsociada = pago.getReserva();
      if (reservaAsociada != null) {
        reservaAsociada.setEstadoReserva("CONFIRMADA");
        reservaRepository.save(reservaAsociada); // Guardamos el cambio de estado en la reserva
      }

      pagoRepository.save(pago);
      return "Pago confirmado y reserva activada exitosamente.";

    } else {
      // El pago falló, fue cancelado, o sigue pendiente
      pago.setEstadoPago("FALLIDO_O_PENDIENTE");
      pagoRepository.save(pago);
      throw new RuntimeException("El pago no se ha completado en Stripe. Estado actual: " + paymentIntent.getStatus());
    }
  }

  @Override
  @Transactional(readOnly = true)
  public List<PagoDTO> listarTodos() {
    return pagoRepository.findAll().stream()
      .map(this::convertirADto)
      .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public List<PagoDTO> listarPorUsuario(Integer usuarioId) {
    return pagoRepository.findByUsuario_UsuarioId(usuarioId).stream()
      .map(this::convertirADto)
      .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public List<PagoDTO> listarPorEstablecimiento(Integer establecimientoId) {
    return pagoRepository.findByEstablecimientoId(establecimientoId).stream()
      .map(this::convertirADto)
      .toList();
  }

  private PagoDTO convertirADto(Pago pago) {
    PagoDTO dto = modelMapper.map(pago, PagoDTO.class);

    // Mapeos manuales de conveniencia para el FrontEnd
    if (pago.getReserva() != null) {
      dto.setReservaId(pago.getReserva().getReservaId());
      if (pago.getReserva().getCancha() != null) {
        dto.setNombreCancha(pago.getReserva().getCancha().getEstablecimiento().getNombreEstablecimiento()); // O como se llame el campo
      }
    }
    if (pago.getUsuario() != null) {
      dto.setNombreUsuario(pago.getUsuario().getNombre());
    }
    return dto;
  }
}
