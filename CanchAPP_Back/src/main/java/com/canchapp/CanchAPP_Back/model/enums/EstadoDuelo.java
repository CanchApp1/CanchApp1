package com.canchapp.CanchAPP_Back.model.enums;

public enum EstadoDuelo {
  PUBLICADO_BLOQUEADO,   // Creador pagó 50%, cancha bloqueada (35% tiempo)
  PUBLICADO_LIBRE,       // Bloqueo expiró, cancha libre para todos, duelo visible
  ACEPTADO_PAGO_PENDIENTE, // Alguien aceptó, tiene 10-15 min para pagar su 50%
  CONFIRMADO,            // Ambos pagaron, se convirtió en Reserva oficial
  CANCELADO_POR_RESERVA, // Alguien reservó normal mientras estaba LIBRE
  EXPIRADO               // Llegó la fecha límite y nadie aceptó
}
