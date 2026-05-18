package com.canchapp.CanchAPP_Back.model;

import com.canchapp.CanchAPP_Back.model.enums.EstadoDuelo;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "duelo", schema = "general")
public class Duelo {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "duelo_id", nullable = false)
  private Integer dueloId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "creador_id", nullable = false)
  private Usuario creador;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "oponente_id")
  private Usuario oponente;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "cancha_id", nullable = false)
  private Cancha cancha;

  @Column(name = "fecha", nullable = false)
  private LocalDate fecha;

  @Column(name = "hora_inicio", nullable = false)
  private LocalTime horaInicio;

  @Column(name = "hora_fin", nullable = false)
  private LocalTime horaFin;

  @Column(name = "descripcion", columnDefinition = "TEXT")
  private String descripcion;

  @Enumerated(EnumType.STRING) // Recomendado usar Enum en vez de String
  @Column(name = "estado_duelo", length = 50)
  private EstadoDuelo estadoDuelo;

  @Column(name = "fecha_fin_bloqueo_cancha", nullable = false)
  private LocalDateTime fechaFinBloqueoCancha;

  @Column(name = "fecha_expiracion_duelo", nullable = false)
  private LocalDateTime fechaExpiracionDuelo; // Cambiado a LocalDateTime para mayor precisión

  // --- CAMPOS DE AUDITORÍA ---
  @Column(name = "estado_activo")
  private Boolean estadoActivo; // Para borrado lógico

  @Column(name = "fecha_creacion")
  private LocalDateTime fechaCreacion;

  @Column(name = "usuario_creacion", length = 100)
  private String usuarioCreacion;

  @Column(name = "fecha_modificacion")
  private LocalDateTime fechaModificacion;

  @Column(name = "usuario_modificacion", length = 100)
  private String usuarioModificacion;
}
