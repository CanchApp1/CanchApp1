package com.canchapp.CanchAPP_Back.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "horario_establecimiento")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HorarioEstablecimiento {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "horario_id")
  private Integer horarioId;

  // RELACIÓN: Un establecimiento tiene varios horarios (uno por cada día)
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "establecimiento_id", nullable = false)
  private Establecimiento establecimiento;

  // Guardaremos el día de la semana. Ej: "MONDAY", "TUESDAY", etc.
  @Column(name = "dia_semana", length = 20, nullable = false)
  private String diaSemana;

  // La hora exacta a la que abren. Ej: 08:00
  @Column(name = "hora_apertura")
  private LocalTime horaApertura;

  // La hora exacta a la que cierran. Ej: 22:00
  @Column(name = "hora_cierre")
  private LocalTime horaCierre;

  //
  @Column(name = "cerrado_todo_el_dia")
  private Boolean cerradoTodoElDia;

  // --- CAMPOS DE AUDITORÍA ---
  @Column(name = "estado_activo")
  private Boolean estadoActivo; // true = vigente, false = borrado lógico

  @Column(name = "fecha_creacion")
  private LocalDateTime fechaCreacion;

  @Column(name = "usuario_creacion", length = 100)
  private String usuarioCreacion;

  @Column(name = "fecha_modificacion")
  private LocalDateTime fechaModificacion;

  @Column(name = "usuario_modificacion", length = 100)
  private String usuarioModificacion;
}
