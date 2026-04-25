package com.canchapp.CanchAPP_Back.repository;

import com.canchapp.CanchAPP_Back.model.RecuperacionPassword;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecuperacionPasswordRepository extends JpaRepository<RecuperacionPassword, Integer> {

  // Solo necesitamos buscar si el usuario tiene un código activo (usado = false)
  Optional<RecuperacionPassword> findFirstByUsuario_UsuarioIdAndUsadoFalseOrderByFechaExpiracionDesc(Integer usuarioId);

  // Para invalidar todos los anteriores al crear uno nuevo
  List<RecuperacionPassword> findByUsuario_UsuarioIdAndUsadoFalse(Integer usuarioId);
}
