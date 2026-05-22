package com.canchapp.CanchAPP_Back.controller;

import com.canchapp.CanchAPP_Back.dto.ComentarioDTO;
import com.canchapp.CanchAPP_Back.model.Comentario;
import com.canchapp.CanchAPP_Back.repository.ComentarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Gestión de comentarios para el SuperAdministrador.
 * El ComentarioServiceImpl.eliminarMiComentario() valida que seas el autor,
 * por eso el SuperAdmin necesita su propio método que omite esa validación.
 */
@RestController
@RequestMapping("/v1/api/admin/comentarios")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminComentarioController {

    private final ComentarioRepository comentarioRepository;

    /**
     * HUS-003: Listar todos los comentarios activos del sistema.
     * Incluye el nombre del establecimiento para que el SuperAdmin tenga contexto.
     */
    @GetMapping
    @PreAuthorize("hasAuthority('SUPERADMIN')")
    public ResponseEntity<List<ComentarioDTO>> listarTodos() {
        List<ComentarioDTO> resultado = comentarioRepository
                .findByEstadoActivoTrueOrderByFechaDescHoraDesc()
                .stream()
                .map(this::mapearADTO)
                .toList();
        return ResponseEntity.ok(resultado);
    }

    /**
     * HUS-003: Eliminar cualquier comentario como SuperAdmin (sin validar autoría).
     * Soft delete: el comentario queda en BD con estadoActivo=false para trazabilidad.
     */
    @DeleteMapping("/{comentarioId}")
    @PreAuthorize("hasAuthority('SUPERADMIN')")
    public ResponseEntity<?> eliminarComentario(@PathVariable Integer comentarioId) {
        Comentario comentario = comentarioRepository.findById(comentarioId)
                .orElseThrow(() -> new RuntimeException("Comentario no encontrado"));

        comentario.setEstadoActivo(false);
        comentario.setFechaModificacion(LocalDateTime.now());
        comentario.setUsuarioModificacion("SUPERADMIN");

        comentarioRepository.save(comentario);
        return ResponseEntity.ok("Comentario eliminado correctamente.");
    }

    private ComentarioDTO mapearADTO(Comentario c) {
        ComentarioDTO dto = new ComentarioDTO();
        dto.setComentarioId(c.getComentarioId());
        dto.setComentario(c.getComentario());
        dto.setHora(c.getHora());
        dto.setFecha(c.getFecha());
        dto.setEstablecimientoId(c.getEstablecimiento().getEstablecimientoId());
        dto.setNombreEstablecimiento(c.getEstablecimiento().getNombreEstablecimiento());
        dto.setUsuarioId(c.getUsuario().getUsuarioId());
        dto.setNombreUsuario(c.getUsuario().getNombre());
        return dto;
    }
}
