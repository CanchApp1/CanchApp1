package com.canchapp.CanchAPP_Back.repository;

import com.canchapp.CanchAPP_Back.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Integer> {

  //Metodo para evitar cruces horarios
  @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END " +
    "FROM Reserva r " +
    "WHERE r.cancha.canchaId = :canchaId " +
    "AND r.fecha = :fecha " +
    "AND r.estadoActivo = true " +
    "AND r.estadoReserva != 'CANCELADA' " +
    "AND r.horaInicio < :horaFin " +
    "AND r.horaFin > :horaInicio")
  boolean existeCruceDeHorarios(@Param("canchaId") Integer canchaId,
                                @Param("fecha") LocalDate fecha,
                                @Param("horaInicio") LocalTime horaInicio,
                                @Param("horaFin") LocalTime horaFin);

  //Para consultar las reservas de un usuario específico (Mi Historial)
  List<Reserva> findByUsuario_UsuarioIdAndEstadoActivoTrue(Integer usuarioId);

  //Para traer todas las reservas de una cancha en un día (Para pintar el calendario ocupado/libre en el FrontEnd)
  List<Reserva> findByCancha_CanchaIdAndFechaAndEstadoActivoTrueAndEstadoReservaNot(Integer canchaId, LocalDate fecha, String estadoReserva);

  //Buscar todas las reservas de todas las canchas de un establecimiento
  List<Reserva> findByCancha_Establecimiento_EstablecimientoIdAndEstadoActivoTrue(Integer establecimientoId);

  //Obtener el historial de un usuario ordenado de más reciente a más antiguo
  List<Reserva> findByUsuario_UsuarioIdAndEstadoActivoTrueOrderByFechaDescHoraInicioDesc(Integer usuarioId);

  //Buscar reservas por una cancha en específico (ignorando las eliminadas)
  List<Reserva> findByCancha_CanchaIdAndEstadoActivoTrue(Integer canchaId);
}
