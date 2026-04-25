package com.canchapp.CanchAPP_Back.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "perfil", schema = "seguridad")
public class Perfil {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "perfil_id", nullable = false)
  private Integer perfilId;

  @Column(nullable = false, length = 50)
  private String codigo;

  @Column(nullable = false, length = 150)
  private String nombre;

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
