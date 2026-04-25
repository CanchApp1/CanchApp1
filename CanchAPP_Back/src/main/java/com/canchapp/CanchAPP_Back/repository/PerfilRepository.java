package com.canchapp.CanchAPP_Back.repository;

import com.canchapp.CanchAPP_Back.model.Perfil;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PerfilRepository extends JpaRepository<Perfil, Integer> {
  Optional<Perfil> findByNombre(String nombre);
  Optional<Perfil> findByCodigo(String codigo);
}
