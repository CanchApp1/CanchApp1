package com.canchapp.CanchAPP_Back.repository;

import com.canchapp.CanchAPP_Back.model.Comentario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ComentarioRepository extends JpaRepository<Comentario, Integer> {

  List<Comentario> findByEstablecimiento_EstablecimientoIdAndEstadoActivoTrueOrderByFechaDescHoraDesc(Integer establecimientoId);

  // Para SuperAdmin: todos los comentarios activos del sistema
  List<Comentario> findByEstadoActivoTrueOrderByFechaDescHoraDesc();
}
