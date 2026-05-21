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

  @Query("SELECT r FROM Reserva r " +
    "WHERE r.cancha.establecimiento.usuario.correo = :correoPropietario " +
    "AND r.estadoActivo = TRUE " +
    "AND (r.estadoReserva = 'CONFIRMADO' OR r.estadoReserva = 'CONFIRMADA') " +
    "AND r.fecha BETWEEN :fechaInicio AND :fechaFin")
  List<Reserva> buscarReservasParaOcupacion(
    @Param("correoPropietario") String correoPropietario,
    @Param("fechaInicio") LocalDate fechaInicio,
    @Param("fechaFin") LocalDate fechaFin);

  @Query("SELECT r FROM Reserva r " +
    "WHERE r.cancha.establecimiento.usuario.correo = :correoPropietario " +
    "AND r.usuario.correo != :correoPropietario " + // <-- EXCLUYE AL PROPIETARIO LOGEADO
    "AND r.estadoActivo = TRUE " +
    "AND (r.estadoReserva = 'CONFIRMADO' OR r.estadoReserva = 'CONFIRMADA') " +
    "AND r.fecha BETWEEN :fechaInicio AND :fechaFin")
  List<Reserva> buscarReservasParaClientesFrecuentes(
    @Param("correoPropietario") String correoPropietario,
    @Param("fechaInicio") LocalDate fechaInicio,
    @Param("fechaFin") LocalDate fechaFin);

  //HOras pico y horas vaye por dia de la semana
  @Query(value = "SELECT v.hora, COUNT(r.reserva_id) AS total " +
    "FROM generate_series(6, 23) v(hora) " +
    "LEFT JOIN reserva r ON r.estado_activo = true " +
    "  AND r.estado_reserva <> 'CANCELADA' " +
    "  AND r.fecha BETWEEN :fechaInicio AND :fechaFin " +
    "  AND EXTRACT(ISODOW FROM r.fecha) = :diaSemanaIdx " +
    "  AND r.cancha_id IN (" +
    "      SELECT c.cancha_id " +
    "      FROM general.cancha c " +
    "      JOIN general.establecimiento e ON c.establecimiento_id = e.establecimiento_id " +
    "      JOIN seguridad.usuario u ON e.usuario_usuario_id = u.usuario_id " + // <-- CORREGIDO: e.usuario_usuario_id
    "      WHERE u.correo = :correoPropietario AND c.estado_activo = true" +
    "  ) " +
    "  AND v.hora >= EXTRACT(HOUR FROM r.hora_inicio) " +
    "  AND v.hora < EXTRACT(HOUR FROM r.hora_fin) " +
    "GROUP BY v.hora " +
    "ORDER BY v.hora", nativeQuery = true)
  List<Object[]> contarReservasPorHoraYDiaPostgreSQL(
    @Param("correoPropietario") String correoPropietario,
    @Param("fechaInicio") LocalDate fechaInicio,
    @Param("fechaFin") LocalDate fechaFin,
    @Param("diaSemanaIdx") int diaSemanaIdx);

}
