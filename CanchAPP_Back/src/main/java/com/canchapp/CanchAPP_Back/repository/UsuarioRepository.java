package com.canchapp.CanchAPP_Back.repository;

import com.canchapp.CanchAPP_Back.model.Usuario;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
  @EntityGraph(attributePaths = {"perfil"})
  Optional<Usuario> findByCorreo(String correo);
  boolean existsByCorreoAndUsuarioIdNot(String correo, Integer usuarioId);
}
