package com.canchapp.CanchAPP_Back.repository;

import com.canchapp.CanchAPP_Back.model.PagoDuelo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PagoDueloRepository extends JpaRepository<PagoDuelo, Integer> {
  List<PagoDuelo> findByDuelo_DueloId(Integer dueloId);

  @Query("SELECT COALESCE(SUM(pd.valorPago), 0) FROM PagoDuelo pd " +
    "WHERE pd.duelo.cancha.establecimiento.usuario.correo = :correoPropietario " +
    "AND pd.estadoPago = 'COMPLETADO' " +
    "AND pd.fecha BETWEEN :fechaInicio AND :fechaFin")
  BigDecimal sumarIngresosDuelosPorPropietarioYRango(
    @Param("correoPropietario") String correoPropietario,
    @Param("fechaInicio") LocalDate fechaInicio,
    @Param("fechaFin") LocalDate fechaFin);
}
