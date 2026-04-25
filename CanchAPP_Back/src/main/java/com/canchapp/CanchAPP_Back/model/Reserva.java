package com.canchapp.CanchAPP_Back.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "reserva")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reserva {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "reserva_id")
  private Integer reservaId;

  //El usuario que hace la reserva
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "usuario_id", nullable = false)
  private Usuario usuario; // Asumo que tienes una entidad Usuario

  //La cancha específica que se está reservando
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

  // Estado vital para saber si calculamos esta hora como ocupada o libre
  @Column(name = "estado_reserva", length = 50)
  private String estadoReserva;

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
