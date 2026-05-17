package com.canchapp.CanchAPP_Back.service.implement;

import com.canchapp.CanchAPP_Back.dto.DueloDTO;
import com.canchapp.CanchAPP_Back.model.*;
import com.canchapp.CanchAPP_Back.model.enums.EstadoDuelo;
import com.canchapp.CanchAPP_Back.repository.*;
import com.canchapp.CanchAPP_Back.service.interfaces.DueloService;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class DueloServiceImpl implements DueloService {

  private final DueloRepository dueloRepository;
  private final PagoDueloRepository pagoDueloRepository;
  private final CanchaRepository canchaRepository;
  private final UsuarioRepository usuarioRepository;
  private final ReservaRepository reservaRepository; // Para validar disponibilidad normal
  private final ModelMapper modelMapper;

  @Override
  @Transactional
  public DueloDTO publicarDuelo(DueloDTO dto) {
    // 1. Identificar al creador por el Token
    String correoAutenticado = SecurityContextHolder.getContext().getAuthentication().getName();
    Usuario creador = usuarioRepository.findByCorreo(correoAutenticado)
      .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

    Cancha cancha = canchaRepository.findById(dto.getCanchaId())
      .orElseThrow(() -> new RuntimeException("Cancha no encontrada"));

    // 2. VALIDACIÓN DE TIEMPOS (Regla: Mín 3 días, Máx 1 semana)
    LocalDateTime ahora = LocalDateTime.now();
    LocalDateTime fechaHoraPartido = LocalDateTime.of(dto.getFecha(), dto.getHoraInicio());

    long diasDeDiferencia = ChronoUnit.DAYS.between(ahora.toLocalDate(), dto.getFecha());

    if (diasDeDiferencia < 3 || diasDeDiferencia > 7) {
      throw new RuntimeException("Un duelo debe publicarse con un mínimo de 3 días y un máximo de 1 semana de anticipación.");
    }

    // Revisamos si ya hay reservas normales en ese horario
    boolean tieneReservaNormal = reservaRepository.existeCruceDeHorarios(
      cancha.getCanchaId(), dto.getFecha(), dto.getHoraInicio(), dto.getHoraFin());

    // Revisamos si hay otros duelos activos cruzados
    List<Duelo> duelosConflictivos = dueloRepository.buscarDuelosConflictivos(
      cancha.getCanchaId(), dto.getFecha(), dto.getHoraInicio(), dto.getHoraFin());

    if (tieneReservaNormal || !duelosConflictivos.isEmpty()) {
      throw new RuntimeException("La cancha ya no está disponible para ese horario. Alguien te ganó por milisegundos.");
    }

    // 4. CÁLCULO DE BLOQUEO PROPORCIONAL (Regla: 35% del tiempo, máx 24h)
    long horasHastaPartido = ChronoUnit.HOURS.between(ahora, fechaHoraPartido);
    double horasDeBloqueoCalculadas = horasHastaPartido * 0.35;
    long horasRealesBloqueo = (long) Math.min(24, horasDeBloqueoCalculadas);

    LocalDateTime finBloqueoCancha = ahora.plusHours(horasRealesBloqueo);

    // 5. CREACIÓN DEL DUELO
    Duelo duelo = Duelo.builder()
      .creador(creador)
      .cancha(cancha)
      .fecha(dto.getFecha())
      .horaInicio(dto.getHoraInicio())
      .horaFin(dto.getHoraFin())
      .descripcion(dto.getDescripcion())
      .estadoDuelo(EstadoDuelo.PUBLICADO_BLOQUEADO)
      .fechaFinBloqueoCancha(finBloqueoCancha)
      .fechaExpiracionDuelo(fechaHoraPartido.minusHours(2)) // Expira 2h antes si nadie aceptó
      .estadoActivo(true)
      .fechaCreacion(ahora)
      .usuarioCreacion(correoAutenticado)
      .build();

    Duelo dueloGuardado = dueloRepository.save(duelo);

    // 6. REGISTRO DEL PAGO (Regla: El creador paga el 50%)
    BigDecimal valorTotal = calcularPrecio(cancha.getPrecioPorHora(), dto.getHoraInicio(), dto.getHoraFin());
    BigDecimal mitad = valorTotal.divide(BigDecimal.valueOf(2), 0, RoundingMode.HALF_UP);

    // 7. INTEGRACIÓN CON STRIPE (Estilo PagoServiceImpl)
    long montoEnCentavos = mitad.multiply(new BigDecimal("100")).longValue();

    PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
      .setAmount(montoEnCentavos)
      .setCurrency("cop")
      .putMetadata("duelo_id", dueloGuardado.getDueloId().toString())
      .setPaymentMethod("pm_card_visa") // Tarjeta de prueba
      .setConfirm(true) // Cobro inmediato
      .setReturnUrl("http://localhost:8080")
      .build();

    PaymentIntent paymentIntent;
    try {
      paymentIntent = PaymentIntent.create(params);
    } catch (com.stripe.exception.StripeException e) {
      throw new RuntimeException("Error al procesar el pago del creador con Stripe: " + e.getMessage());
    }

    // 8. REGISTRO DEL PAGO (Regla: El creador paga el 50%)
    PagoDuelo pagoCreador = PagoDuelo.builder()
      .duelo(dueloGuardado)
      .usuario(creador)
      .fecha(ahora.toLocalDate())
      .horaPago(ahora.toLocalTime())
      .valorPago(mitad)
      .conceptoPago("MITAD_CREADOR")
      .stripePaymentId(paymentIntent.getId()) // Guardamos el ID generado por Stripe
      .estadoPago("COMPLETADO")
      .fechaCreacion(ahora)
      .usuarioCreacion(correoAutenticado)
      .build();

    pagoDueloRepository.save(pagoCreador);

    // Mapeamos el resultado
    DueloDTO respuesta = modelMapper.map(dueloGuardado, DueloDTO.class);
    respuesta.setStripePaymentId(paymentIntent.getClientSecret());

    return respuesta;
  }

  @Override
  public List<DueloDTO> listarDuelosDisponibles() {
    // Solo mostramos duelos que no han expirado y están en estado Publicado
    List<String> estadosVisibles = List.of(EstadoDuelo.PUBLICADO_BLOQUEADO.name(), EstadoDuelo.PUBLICADO_LIBRE.name());
    return dueloRepository.findByEstadoDueloInAndEstadoActivoTrueOrderByFechaAsc(estadosVisibles)
      .stream()
      .map(d -> modelMapper.map(d, DueloDTO.class))
      .collect(Collectors.toList());
  }

  @Override
  public DueloDTO obtenerDetalleDuelo(Integer id) {
    Duelo duelo = dueloRepository.findById(id)
      .orElseThrow(() -> new RuntimeException("Duelo no encontrado"));
    return modelMapper.map(duelo, DueloDTO.class);
  }

  // Método auxiliar para el cálculo de precio
  private BigDecimal calcularPrecio(Double precioHora, java.time.LocalTime inicio, java.time.LocalTime fin) {
    long minutos = ChronoUnit.MINUTES.between(inicio, fin);
    double horas = minutos / 60.0;
    BigDecimal total = BigDecimal.valueOf(horas * precioHora);
    return total.setScale(0, RoundingMode.HALF_UP);
  }

  @Override
  @Transactional
  public DueloDTO aceptarDuelo(Integer idDuelo, String stripePaymentId) {
    // 1. Identificar al Oponente (quien acepta el reto)
    String correoAutenticado = SecurityContextHolder.getContext().getAuthentication().getName();
    Usuario oponente = usuarioRepository.findByCorreo(correoAutenticado)
      .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

    // 2. Buscar el Duelo
    Duelo duelo = dueloRepository.findById(idDuelo)
      .orElseThrow(() -> new RuntimeException("Duelo no encontrado"));

    // 3. VALIDACIONES IMPORTANTES
    if (duelo.getCreador().getUsuarioId().equals(oponente.getUsuarioId())) {
      throw new RuntimeException("Tranquilo, no puedes aceptar tu propio duelo.");
    }

    // Solo se pueden aceptar duelos que sigan "PUBLICADOS"
    if (duelo.getEstadoDuelo() != EstadoDuelo.PUBLICADO_BLOQUEADO &&
      duelo.getEstadoDuelo() != EstadoDuelo.PUBLICADO_LIBRE) {
      throw new RuntimeException("Este duelo ya fue aceptado por alguien más o ha expirado.");
    }

    // 4. CALCULAR Y COBRAR EL 50% RESTANTE
    LocalDateTime ahora = LocalDateTime.now();
    BigDecimal valorTotal = calcularPrecio(duelo.getCancha().getPrecioPorHora(), duelo.getHoraInicio(), duelo.getHoraFin());
    BigDecimal mitad = valorTotal.divide(BigDecimal.valueOf(2), 0, RoundingMode.HALF_UP);

    // 5. INTEGRACIÓN CON STRIPE (El oponente paga)
    long montoEnCentavos = mitad.multiply(new BigDecimal("100")).longValue();

    PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
      .setAmount(montoEnCentavos)
      .setCurrency("cop")
      .putMetadata("duelo_id_aceptado", duelo.getDueloId().toString())
      .setPaymentMethod("pm_card_visa") // Tarjeta de prueba
      .setConfirm(true) // Cobro inmediato
      .setReturnUrl("http://localhost:8080")
      .build();

    PaymentIntent paymentIntent;
    try {
      paymentIntent = PaymentIntent.create(params);
    } catch (com.stripe.exception.StripeException e) {
      throw new RuntimeException("Error al procesar el pago del oponente con Stripe: " + e.getMessage());
    }

    // 6. REGISTRO DEL PAGO DEL OPONENTE
    PagoDuelo pagoOponente = PagoDuelo.builder()
      .duelo(duelo)
      .usuario(oponente)
      .fecha(ahora.toLocalDate())
      .horaPago(ahora.toLocalTime())
      .valorPago(mitad)
      .conceptoPago("MITAD_OPONENTE")
      .stripePaymentId(paymentIntent.getId()) // ID generado por Stripe para el Oponente
      .estadoPago("COMPLETADO")
      .fechaCreacion(ahora)
      .usuarioCreacion(SecurityContextHolder.getContext().getAuthentication().getName())
      .build();

    pagoDueloRepository.save(pagoOponente);

    // 7. SELLAR EL DUELO COMO CONFIRMADO
    duelo.setOponente(oponente);
    duelo.setEstadoDuelo(EstadoDuelo.CONFIRMADO);
    duelo.setFechaFinBloqueoCancha(null);

    Duelo dueloGuardado = dueloRepository.save(duelo);

    return modelMapper.map(dueloGuardado, DueloDTO.class);
  }
}
