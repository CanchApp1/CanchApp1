package com.canchapp.CanchAPP_Back.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class ComentarioDTO {
  private Integer comentarioId;
  private String comentario;
  private LocalTime hora;
  private LocalDate fecha;

  // Datos utiles para el FrontEnd
  private Integer establecimientoId;
  private String nombreUsuario; // Para mostrar quien comento
  private Integer usuarioId;
}
