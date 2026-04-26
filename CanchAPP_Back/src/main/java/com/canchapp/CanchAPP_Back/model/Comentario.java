package com.canchapp.CanchAPP_Back.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Entity
@Table(name = "comentario")
public class Comentario {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "comentario_id")
  private Integer comentarioId;

  @ManyToOne
  @JoinColumn(name = "establecimiento_id", nullable = false)
  private Establecimiento establecimiento;

  @ManyToOne
  @JoinColumn(name = "usuario_id", nullable = false)
  private Usuario usuario;

  @Column(name = "comentario", columnDefinition = "TEXT", nullable = false)
  private String comentario;

  @Column(name = "hora", nullable = false)
  private LocalTime hora;

  @Column(name = "fecha", nullable = false)
  private LocalDate fecha;

  // --- Auditoría ---
  @Column(name = "fecha_creacion", updatable = false)
  private LocalDateTime fechaCreacion;

  @Column(name = "usuario_creacion", length = 50, updatable = false)
  private String usuarioCreacion;

  @Column(name = "fecha_modificacion")
  private LocalDateTime fechaModificacion;

  @Column(name = "usuario_modificacion", length = 50)
  private String usuarioModificacion;

  @Column(name = "estado_activo")
  private Boolean estadoActivo;
}
