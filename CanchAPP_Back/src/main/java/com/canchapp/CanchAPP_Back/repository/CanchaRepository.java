package com.canchapp.CanchAPP_Back.repository;

import com.canchapp.CanchAPP_Back.model.Cancha;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CanchaRepository extends JpaRepository<Cancha, Integer> {
  List<Cancha> findByEstablecimiento_EstablecimientoIdAndEstadoActivoTrue(Integer establecimientoId);
  boolean existsByEstablecimiento_EstablecimientoIdAndCodigoIgnoreCase(Integer establecimientoId, String codigo);
  List<Cancha> findByEstadoActivoTrue();

  @Query("SELECT COUNT(c) FROM Cancha c " +
    "WHERE c.establecimiento.usuario.correo = :correoPropietario " +
    "AND c.estadoActivo = true")
  long contarCanchasActivasPorPropietario(@Param("correoPropietario") String correoPropietario);

}
