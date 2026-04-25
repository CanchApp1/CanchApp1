package com.canchapp.CanchAPP_Back.repository;

import com.canchapp.CanchAPP_Back.model.HorarioEstablecimiento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HorarioEstablecimientoRepository extends JpaRepository<HorarioEstablecimiento, Integer> {
  // 1. Para listar todos los horarios de un establecimiento
  List<HorarioEstablecimiento> findByEstablecimiento_EstablecimientoIdAndEstadoActivoTrue(Integer establecimientoId);

  // 2. Para validar que no exista ya un horario para ese mismo día
  Optional<HorarioEstablecimiento> findByEstablecimiento_EstablecimientoIdAndDiaSemanaAndEstadoActivoTrue(Integer establecimientoId, String diaSemana);
}
