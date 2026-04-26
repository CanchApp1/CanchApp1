package com.canchapp.CanchAPP_Back.repository;

import com.canchapp.CanchAPP_Back.model.Comentario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ComentarioRepository extends JpaRepository<Comentario, Integer> {

  // Trae los comentarios de un establecimiento ordenados por fecha y hora descendente
  //List<Comentario> findByEstablecimiento_EstablecimientoIdOrderByFechaDescHoraDesc(Integer establecimientoId);
  List<Comentario> findByEstablecimiento_EstablecimientoIdAndEstadoActivoTrueOrderByFechaDescHoraDesc(Integer establecimientoId);
}
