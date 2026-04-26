package com.canchapp.CanchAPP_Back.service.interfaces;

import com.canchapp.CanchAPP_Back.dto.ComentarioDTO;
import java.util.List;

public interface ComentarioService {

  // Metodo para guardar un nuevo comentario
  ComentarioDTO crearComentario(ComentarioDTO dto);

  // Metodo para listar todos los comentarios de un lugar
  List<ComentarioDTO> listarPorEstablecimiento(Integer establecimientoId);

  //editar nuestro propio comentario
  ComentarioDTO editarMiComentario(Integer comentarioId, String nuevoTexto);

  //eliminar nuestro propio cometario
  void eliminarMiComentario(Integer comentarioId);
}
