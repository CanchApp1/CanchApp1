package com.canchapp.CanchAPP_Back.repository;

import com.canchapp.CanchAPP_Back.model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Integer> {

  // Método útil por si luego necesitamos buscar un pago usando el ID de Stripe
  Optional<Pago> findByStripePaymentId(String stripePaymentId);

  // Método útil para buscar el pago de una reserva específica
  Optional<Pago> findByReserva_ReservaId(Integer reservaId);

  List<Pago> findByUsuario_UsuarioId(Integer usuarioId);

  // 2. Pagos por Establecimiento (Navegamos: Pago -> Reserva -> Cancha -> Establecimiento)
  @Query("SELECT p FROM Pago p WHERE p.reserva.cancha.establecimiento.establecimientoId = :establecimientoId")
  List<Pago> findByEstablecimientoId(@Param("establecimientoId") Integer establecimientoId);
}
