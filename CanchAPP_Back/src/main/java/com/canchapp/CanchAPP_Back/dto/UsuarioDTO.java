package com.canchapp.CanchAPP_Back.dto;

import com.canchapp.CanchAPP_Back.model.Perfil;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioDTO {

  @Builder.Default
  private Boolean estado = true;
  private Integer idUsuario;

  @Builder.Default
  private LocalDateTime fechaCreacion = LocalDateTime.now();
  private PerfilDTO perfil;
  private String correo;
  private String codigo;
  private String contrasena;
  private String nombre;
  private LocalDate fechaNacimiento;
  private String numeroTelefono;
  private Integer edad;
  private String usuarioCreacion;
  private String usuarioModificacion;
}
