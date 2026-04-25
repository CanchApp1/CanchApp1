package com.canchapp.CanchAPP_Back.controller;

import com.canchapp.CanchAPP_Back.dto.UsuarioDTO;
import com.canchapp.CanchAPP_Back.service.interfaces.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

  @Autowired
  private UsuarioService usuarioService;

  // Fíjate que no pasamos ningún ID en la URL. El backend sabe quién es por el Token.
  @PutMapping("/mi-perfil")
  public ResponseEntity<?> actualizarMiPerfil(@RequestBody UsuarioDTO usuarioDTO) {
    try {
      UsuarioDTO usuarioActualizado = usuarioService.actualizarMiPerfil(usuarioDTO);
      return ResponseEntity.ok(usuarioActualizado);
    } catch (RuntimeException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    }
  }

  @GetMapping("/jugadores")
  public ResponseEntity<List<UsuarioDTO>> listarJugadores() {
    List<UsuarioDTO> jugadores = usuarioService.listarJugadores();
    return ResponseEntity.ok(jugadores);
  }

  @GetMapping("/{id}")
  public ResponseEntity<UsuarioDTO> obtenerUsuarioPorId(@PathVariable Integer id) {
    UsuarioDTO usuario = usuarioService.obtenerUsuarioPorId(id);
    return ResponseEntity.ok(usuario);
  }

  @GetMapping("/mi-perfil")
  public ResponseEntity<UsuarioDTO> obtenerMiPerfil() {
    UsuarioDTO miPerfil = usuarioService.obtenerMiPerfil();
    return ResponseEntity.ok(miPerfil);
  }
}
