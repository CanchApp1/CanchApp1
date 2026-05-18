package com.canchapp.CanchAPP_Back.repository;

import com.canchapp.CanchAPP_Back.model.Duelo;
import com.canchapp.CanchAPP_Back.model.enums.EstadoDuelo;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DueloRepository extends JpaRepository<Duelo, Integer> {

  //BLOQUEO PESIMISTA: Evita que dos personas acepten el duelo al mismo tiempo
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("SELECT d FROM Duelo d WHERE d.dueloId = :id")
  Optional<Duelo> findByIdWithLock(@Param("id") Integer id);

  // Buscar duelos activos que se crucen con un horario (Para validaciones)
  @Query("SELECT d FROM Duelo d WHERE d.cancha.canchaId = :canchaId " +
    "AND d.fecha = :fecha " +
    "AND d.estadoActivo = true " +
    "AND d.estadoDuelo IN ('PUBLICADO_BLOQUEADO', 'ACEPTADO_PAGO_PENDIENTE', 'CONFIRMADO') " +
    "AND ((d.horaInicio < :horaFin AND d.horaFin > :horaInicio))")
  List<Duelo> buscarDuelosConflictivos(
    @Param("canchaId") Integer canchaId,
    @Param("fecha") LocalDate fecha,
    @Param("horaInicio") LocalTime horaInicio,
    @Param("horaFin") LocalTime horaFin
  );

  // Para el Job que libera canchas (Pasar de BLOQUEADO a LIBRE)
  List<Duelo> findByEstadoDueloAndFechaFinBloqueoCanchaBefore(
    String estado, java.time.LocalDateTime ahora);

  // Listar duelos disponibles para el tablero público
  List<Duelo> findByEstadoDueloInAndEstadoActivoTrueOrderByFechaAsc(List<String> estados);

  List<Duelo> findByCancha_CanchaIdAndFechaAndEstadoActivoTrue(Integer canchaId, LocalDate fecha);
}
