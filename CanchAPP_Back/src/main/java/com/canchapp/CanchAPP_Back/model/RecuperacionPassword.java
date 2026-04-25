package com.canchapp.CanchAPP_Back.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "recuperacion_password", schema = "general")
public class RecuperacionPassword {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_recuperacion")
  private Integer idRecuperacion;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "usuario_id", nullable = false)
  private Usuario usuario;

  @Column(name = "codigo", nullable = false, length = 512)
  private String codigo;

  @Column(name = "fecha_expiracion", nullable = false)
  private LocalDateTime fechaExpiracion;

  @Column(name = "usado", nullable = false)
  @Builder.Default
  private Boolean usado = false;

  @Column(name = "intentos", nullable = false)
  @Builder.Default
  private Integer intentos = 0;
}
