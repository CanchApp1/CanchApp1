package com.canchapp.CanchAPP_Back.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "pago_duelo", schema = "general")
public class PagoDuelo {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "pago_duelo_id")
  private Integer pagoDueloId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "duelo_id", nullable = false)
  private Duelo duelo;

  // El usuario que hizo ESTA mitad del pago (Creador u Oponente)
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "usuario_id", nullable = false)
  private Usuario usuario;

  @Column(name = "fecha", nullable = false)
  private LocalDate fecha;

  @Column(name = "hora_pago", nullable = false)
  private LocalTime horaPago;

  @Column(name = "valor_pago", nullable = false, precision = 12, scale = 2)
  private BigDecimal valorPago;

  // Para saber qué estamos cobrando/reembolsando
  // Ej: "MITAD_CREADOR", "MITAD_OPONENTE"
  @Column(name = "concepto_pago", length = 50, nullable = false)
  private String conceptoPago;

  // CAMPOS PARA STRIPE (Vital para hacer reembolsos automáticos)
  @Column(name = "stripe_payment_id", length = 255, nullable = false)
  private String stripePaymentId;

  @Column(name = "estado_pago", length = 50, nullable = false)
  private String estadoPago; // Ej: COMPLETADO, REEMBOLSADO, PROCESANDO

  // --- Auditoría ---
  @Column(name = "fecha_creacion", updatable = false)
  private LocalDateTime fechaCreacion;

  @Column(name = "usuario_creacion", length = 100, updatable = false)
  private String usuarioCreacion;

  @Column(name = "fecha_modificacion")
  private LocalDateTime fechaModificacion;

  @Column(name = "usuario_modificacion", length = 100)
  private String usuarioModificacion;
}
