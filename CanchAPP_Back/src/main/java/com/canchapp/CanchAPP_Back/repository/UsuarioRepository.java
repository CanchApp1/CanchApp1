package com.canchapp.CanchAPP_Back.repository;

import com.canchapp.CanchAPP_Back.model.Usuario;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
  @EntityGraph(attributePaths = {"perfil"})
  Optional<Usuario> findByCorreo(String correo);
  boolean existsByCorreoAndUsuarioIdNot(String correo, Integer usuarioId);
  boolean existsByCorreo(String correo);
  List<Usuario> findByPerfil_PerfilId(Integer perfilId);

  // Para SuperAdmin: todos los usuarios ordenados por fecha de creación
  List<Usuario> findAllByOrderByFechaCreacionDesc();

  // Para SuperAdmin: filtrar por código de perfil (ej: "JUGADOR", "PROPIETARIO")
  List<Usuario> findByPerfil_CodigoOrderByFechaCreacionDesc(String codigoPerfil);
}
