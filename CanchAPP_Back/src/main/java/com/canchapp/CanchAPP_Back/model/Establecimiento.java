package com.canchapp.CanchAPP_Back.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Data // Genera automáticamente getters, setters, toString, equals, y hashCode.
@Builder // Genera un patrón builder para construir objetos de esta clase.
@NoArgsConstructor // Genera un constructor sin argumentos.
@AllArgsConstructor // Genera un constructor con todos los argumentos.
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "establecimiento", schema = "general")
public class Establecimiento {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "establecimiento_id", nullable = false)
  private Integer establecimientoId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
  private Usuario usuario;

  @Column(name = "nombre_establecimiento", nullable = false, length = 128)
  private String nombreEstablecimiento;

  @Column(name = "direccion", nullable = false, length = 256)
  private String direccion;

  @Column(name="numero_telefono",nullable = false, length = 16)
  private String numeroTelefono;

  @Column(name = "imagen_url", length = 512)
  private String imagenUrl;

  @Column(nullable = false, columnDefinition = "bit default 1")
  private Boolean estado;

  @CreatedDate
  @Column(name = "fecha_creacion", nullable = false)
  private LocalDateTime fechaCreacion;

  @Column(name = "usuario_creacion", nullable = false, length = 128)
  private String usuarioCreacion;

  @LastModifiedDate
  @Column(name = "fecha_modificacion")
  private LocalDateTime fechaModificacion;

  @Column(name = "usuario_modificacion", length = 128)
  private String usuarioModificacion;
}
