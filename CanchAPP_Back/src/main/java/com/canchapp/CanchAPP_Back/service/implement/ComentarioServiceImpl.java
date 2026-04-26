package com.canchapp.CanchAPP_Back.service.implement;

import com.canchapp.CanchAPP_Back.dto.ComentarioDTO;
import com.canchapp.CanchAPP_Back.model.Comentario;
import com.canchapp.CanchAPP_Back.model.Establecimiento;
import com.canchapp.CanchAPP_Back.model.Usuario;
import com.canchapp.CanchAPP_Back.repository.ComentarioRepository;
import com.canchapp.CanchAPP_Back.repository.EstablecimientoRepository;
import com.canchapp.CanchAPP_Back.repository.UsuarioRepository;
import com.canchapp.CanchAPP_Back.service.interfaces.ComentarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ComentarioServiceImpl implements ComentarioService { // Recuerda crear tu interfaz ComentarioService si usas ese patrón

  private final ComentarioRepository comentarioRepository;
  private final EstablecimientoRepository establecimientoRepository;
  private final UsuarioRepository usuarioRepository;

  @Override
  @Transactional
  public ComentarioDTO crearComentario(ComentarioDTO dto) {
    // 1. Obtener usuario autenticado desde el Token
    String correoAutenticado = SecurityContextHolder.getContext().getAuthentication().getName();
    Usuario usuario = usuarioRepository.findByCorreo(correoAutenticado)
      .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

    //Obtener el establecimiento
    Establecimiento establecimiento = establecimientoRepository.findById(dto.getEstablecimientoId())
      .orElseThrow(() -> new RuntimeException("Establecimiento no encontrado"));

    //Construir la entidad
    Comentario comentario = new Comentario();
    comentario.setEstablecimiento(establecimiento);
    comentario.setUsuario(usuario);
    comentario.setComentario(dto.getComentario());
    comentario.setFecha(LocalDate.now()); // Fecha del servidor
    comentario.setHora(LocalTime.now());  // Hora del servidor
    comentario.setEstadoActivo(true);
    //Auditoría
    comentario.setFechaCreacion(LocalDateTime.now());
    comentario.setUsuarioCreacion(correoAutenticado);

    //Guardar
    Comentario guardado = comentarioRepository.save(comentario);

    //Retornar DTO mapeado manualmente para mayor control
    return mapearADTO(guardado);
  }

  @Override
  public List<ComentarioDTO> listarPorEstablecimiento(Integer establecimientoId) {
    List<Comentario> comentarios = comentarioRepository
      .findByEstablecimiento_EstablecimientoIdAndEstadoActivoTrueOrderByFechaDescHoraDesc(establecimientoId);

    return comentarios.stream().map(this::mapearADTO).toList();
  }

  @Override
  @Transactional
  public ComentarioDTO editarMiComentario(Integer comentarioId, String nuevoTexto) {
    String correoAutenticado = SecurityContextHolder.getContext().getAuthentication().getName();

    Comentario comentario = comentarioRepository.findById(comentarioId)
      .orElseThrow(() -> new RuntimeException("Comentario no encontrado"));

    // Validar propiedad: El que esta haciendo la petición es el dueño del comentario?
    if (!comentario.getUsuario().getCorreo().equals(correoAutenticado)) {
      throw new RuntimeException("Acceso denegado: No puedes editar un comentario que no es tuyo.");
    }

    if (!comentario.getEstadoActivo()) {
      throw new RuntimeException("El comentario fue eliminado y no se puede editar.");
    }

    // Actualizamos solo el texto
    comentario.setComentario(nuevoTexto);

    // Auditoría de modificación
    comentario.setFechaModificacion(LocalDateTime.now());
    comentario.setUsuarioModificacion(correoAutenticado);

    return mapearADTO(comentarioRepository.save(comentario));
  }

  @Override
  @Transactional
  public void eliminarMiComentario(Integer comentarioId) {
    String correoAutenticado = SecurityContextHolder.getContext().getAuthentication().getName();

    Comentario comentario = comentarioRepository.findById(comentarioId)
      .orElseThrow(() -> new RuntimeException("Comentario no encontrado"));

    // Validar propiedad
    if (!comentario.getUsuario().getCorreo().equals(correoAutenticado)) {
      throw new RuntimeException("Acceso denegado: No puedes eliminar un comentario que no es tuyo.");
    }

    // "Eliminación" lógica
    comentario.setEstadoActivo(false);

    // Auditoría
    comentario.setFechaModificacion(LocalDateTime.now());
    comentario.setUsuarioModificacion(correoAutenticado);

    comentarioRepository.save(comentario);
  }



  // Metodo auxiliar para mapear de forma segura y enviar el nombre del usuario
  private ComentarioDTO mapearADTO(Comentario c) {
    ComentarioDTO dto = new ComentarioDTO();
    dto.setComentarioId(c.getComentarioId());
    dto.setComentario(c.getComentario());
    dto.setHora(c.getHora());
    dto.setFecha(c.getFecha());
    dto.setEstablecimientoId(c.getEstablecimiento().getEstablecimientoId());
    dto.setUsuarioId(c.getUsuario().getUsuarioId());
    dto.setNombreUsuario(c.getUsuario().getNombre());
    return dto;
  }
}
