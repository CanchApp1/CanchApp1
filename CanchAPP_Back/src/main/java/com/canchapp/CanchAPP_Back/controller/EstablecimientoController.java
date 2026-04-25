package com.canchapp.CanchAPP_Back.controller;

import com.canchapp.CanchAPP_Back.dto.ApiResponse;
import com.canchapp.CanchAPP_Back.dto.EstablecimientoDTO;
import com.canchapp.CanchAPP_Back.dto.ResponseService;
import com.canchapp.CanchAPP_Back.service.interfaces.EstablecimientoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Tag(name = "Establecimiento Controller", description = "Operaciones para la tabla establecimiento del esquema general")
@RequestMapping("/v1/api/establecimiento")
@CrossOrigin(origins = "*", methods = {RequestMethod.DELETE, RequestMethod.GET, RequestMethod.POST,RequestMethod.PUT})
public class EstablecimientoController {

  @Autowired
  private EstablecimientoService establecimientoService;

  @Autowired
  private ResponseService responseService;

  @GetMapping
  @Operation(summary = "Get", description = "Consultar todos los estableciemientos")
  public ResponseEntity<ApiResponse<List<EstablecimientoDTO>>> obtenerTodos() {
    List<EstablecimientoDTO> establecimientos = establecimientoService.obtenerTodos();
    ApiResponse<List<EstablecimientoDTO>> response = responseService.createResponse(establecimientos, "retrieve");
    return ResponseEntity.ok(response);
  }

  @GetMapping("/{id}")
  @Operation(summary = "Get by ID", description = "Consultar un establecimiento por su ID")
  public ResponseEntity<ApiResponse<EstablecimientoDTO>> obtenerPorId(@PathVariable Integer id) {

    EstablecimientoDTO establecimiento = establecimientoService.obtenerPorId(id);
    ApiResponse<EstablecimientoDTO> response = responseService.createResponse(establecimiento, "retrieve");
    return ResponseEntity.ok(response);
  }

  @PostMapping
  @Operation(summary = "Create", description = "Crear un nuevo establecimiento junto con su usuario administrador (dueño)")
  public ResponseEntity<ApiResponse<EstablecimientoDTO>> crearEstablecimiento(@RequestBody EstablecimientoDTO establecimientoDTO) {
    EstablecimientoDTO nuevoEstablecimiento = establecimientoService.crearEstablecimiento(establecimientoDTO);
    ApiResponse<EstablecimientoDTO> response = responseService.createResponse(nuevoEstablecimiento, "create");
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @PutMapping("/{id}")
  @Operation(summary = "Update", description = "Actualizar la información básica de un establecimiento existente")
  public ResponseEntity<ApiResponse<EstablecimientoDTO>> actualizarEstablecimiento(
    @PathVariable Integer id,
    @RequestBody EstablecimientoDTO establecimientoDTO) {
    EstablecimientoDTO establecimientoActualizado = establecimientoService.actualizarEstablecimiento(id, establecimientoDTO);
    ApiResponse<EstablecimientoDTO> response = responseService.createResponse(establecimientoActualizado, "update");
    return ResponseEntity.ok(response);
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Delete", description = "Eliminar (desactivar) un establecimiento por su ID")
  public ResponseEntity<ApiResponse<Void>> eliminarEstablecimiento(@PathVariable Integer id) {
    establecimientoService.eliminarEstablecimiento(id);
    ApiResponse<Void> response = responseService.createResponse(null, "delete");
    return ResponseEntity.ok(response);
  }

  @PutMapping("/{id}/activar")
  @Operation(summary = "Reactivate", description = "Vuelve a activar un establecimiento que fue eliminado lógicamente")
  public ResponseEntity<ApiResponse<Void>> activarEstablecimiento(@PathVariable Integer id) {
    establecimientoService.activarEstablecimiento(id);
    ApiResponse<Void> response = responseService.createResponse(null, "update");
    return ResponseEntity.ok(response);
  }

  @GetMapping("/{id}/imagen")
  public ResponseEntity<?> obtenerImagen(@PathVariable Integer id) {
    try {
      String url = establecimientoService.obtenerImagenUrl(id);
      if (url == null || url.isEmpty()) {
        return ResponseEntity.noContent().build();
      }
      // Devolvemos un objeto simple con la URL
      return ResponseEntity.ok(java.util.Map.of("url", url));
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    }
  }
}
