package com.canchapp.CanchAPP_Back.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.List;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data // Genera automáticamente getters, setters, toString, equals, y hashCode.
@Builder // Genera un patrón builder para construir objetos de esta clase.
@NoArgsConstructor // Genera un constructor sin argumentos.
@AllArgsConstructor // Genera un constructor con todos los argumentos.
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "usuario", schema = "seguridad")
public class Usuario implements UserDetails{
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "usuario_id", nullable = false)
  private Integer usuarioId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
  private Perfil perfil;

  @Column(nullable = false, length = 256)
  private String correo;

  @Column(nullable = false, length = 512)
  private String contrasena;

  @Column(length = 512)
  private String codigo;

  @Column(nullable = false, length = 128)
  private String nombre;

  @Column(nullable = false)
  private LocalDate fechaNacimiento;

  @Column(nullable = false, length = 16)
  private String numeroTelefono;

  @Column(nullable = false)
  private Integer edad;

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

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    // Si tienes perfiles en tu base de datos, lo ideal es esto:
    if (this.perfil != null) {
      return List.of(new SimpleGrantedAuthority(this.perfil.getNombre()));
    }
    return List.of(new SimpleGrantedAuthority("ROLE_USER")); // Un rol por defecto para que no falle
  }

  @Override
  public String getPassword() {
    return this.contrasena; // Tu campo de contraseña
  }

  @Override
  public String getUsername() {
    return this.correo; // Usaremos el correo como identificador único
  }

  @Override
  public boolean isAccountNonExpired() {
    return true;
  }

  @Override
  public boolean isAccountNonLocked() {
    return true;
  }

  @Override
  public boolean isCredentialsNonExpired() {
    return true;
  }

  @Override
  public boolean isEnabled() {
    return true;
  }

}

