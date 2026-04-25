package com.canchapp.CanchAPP_Back.repository;

import com.canchapp.CanchAPP_Back.model.Cancha;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CanchaRepository extends JpaRepository<Cancha, Integer> {
  List<Cancha> findByEstablecimiento_EstablecimientoId(Integer establecimientoId);
}
