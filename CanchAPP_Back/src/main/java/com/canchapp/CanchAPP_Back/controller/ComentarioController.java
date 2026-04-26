package com.canchapp.CanchAPP_Back.controller;

import com.canchapp.CanchAPP_Back.dto.ComentarioDTO;
import com.canchapp.CanchAPP_Back.service.implement.ComentarioServiceImpl;
import com.canchapp.CanchAPP_Back.service.interfaces.ComentarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/api/comentarios")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ComentarioController {

  private final ComentarioService comentarioService;

  // POST: Para crear un comentario (Requiere Token)
  @PostMapping
  public ResponseEntity<ComentarioDTO> crearComentario(@RequestBody ComentarioDTO comentarioDTO) {
    return ResponseEntity.ok(comentarioService.crearComentario(comentarioDTO));
  }

  // GET: Para ver los comentarios del perfil de un establecimiento
  @GetMapping("/establecimiento/{establecimientoId}")
  public ResponseEntity<List<ComentarioDTO>> listarPorEstablecimiento(@PathVariable Integer establecimientoId) {
    return ResponseEntity.ok(comentarioService.listarPorEstablecimiento(establecimientoId));
  }

  @PutMapping("/{comentarioId}")
  public ResponseEntity<ComentarioDTO> editarComentario(
    @PathVariable Integer comentarioId,
    @RequestBody ComentarioDTO comentarioDTO) { // Usamos el DTO para recibir el nuevo texto

    return ResponseEntity.ok(comentarioService.editarMiComentario(comentarioId, comentarioDTO.getComentario()));
  }

  // DELETE: Para eliminar un comentario propio (Soft Delete)
  @DeleteMapping("/{comentarioId}")
  public ResponseEntity<String> eliminarComentario(@PathVariable Integer comentarioId) {
    comentarioService.eliminarMiComentario(comentarioId);
    return ResponseEntity.ok("Comentario eliminado correctamente");
  }
}
