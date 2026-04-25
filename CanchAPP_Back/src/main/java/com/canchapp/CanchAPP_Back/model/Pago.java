package com.canchapp.CanchAPP_Back.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Entity
@Table(name = "pago")
public class Pago {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "pago_id")
  private Integer pagoId;

  // Relación con Reserva
  @OneToOne // Usualmente un pago corresponde a una reserva específica
  @JoinColumn(name = "reserva_id", nullable = false)
  private Reserva reserva;

  // Relación con Usuario
  @ManyToOne
  @JoinColumn(name = "usuario_id", nullable = false)
  private Usuario usuario;

  @Column(name = "fecha", nullable = false)
  private LocalDate fecha;

  @Column(name = "hora_pago", nullable = false)
  private LocalTime horaPago;

  @Column(name = "valor_pago", nullable = false, precision = 12, scale = 2)
  private BigDecimal valorPago;

  //  CAMPOS PARA STRIPE
  @Column(name = "stripe_payment_id", length = 255)
  private String stripePaymentId;

  @Column(name = "estado_pago", length = 50, nullable = false)
  private String estadoPago; // Ej: PENDIENTE, COMPLETADO, FALLIDO

  // Auditoría
  @Column(name = "fecha_creacion", updatable = false)
  private LocalDateTime fechaCreacion;

  @Column(name = "usuario_creacion", length = 50, updatable = false)
  private String usuarioCreacion;

  @Column(name = "fecha_modificacion")
  private LocalDateTime fechaModificacion;

  @Column(name = "usuario_modificacion", length = 50)
  private String usuarioModificacion;
}
