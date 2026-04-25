package com.canchapp.CanchAPP_Back.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Data // Genera automáticamente getters, setters, toString, equals, y hashCode.
@Builder // Genera un patrón builder para construir objetos de esta clase.
@NoArgsConstructor // Genera un constructor sin argumentos.
@AllArgsConstructor // Genera un constructor con todos los argumentos.
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "cancha", schema = "general")
public class Cancha {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "cancha_id", nullable = false)
  private Integer canchaId;

  // relacion: muchas canchas pertenecen a un establecimiento
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "establecimiento_id", nullable = false)
  private Establecimiento establecimiento;

  @Column(name = "codigo", length = 64)
  private String codigo;

  @Column(name = "estado", length = 64)
  private String estado;

  @Column(name = "precio_por_hora")
  private Double precioPorHora;

  @Column(name = "estado_activo")
  private Boolean estadoActivo; // true = visible, false = borrado lógico

  @Column(name = "fecha_creacion")
  private LocalDateTime fechaCreacion;

  @Column(name = "usuario_creacion", length = 100)
  private String usuarioCreacion;

  @Column(name = "fecha_modificacion")
  private LocalDateTime fechaModificacion;

  @Column(name = "usuario_modificacion", length = 100)
  private String usuarioModificacion;

}
