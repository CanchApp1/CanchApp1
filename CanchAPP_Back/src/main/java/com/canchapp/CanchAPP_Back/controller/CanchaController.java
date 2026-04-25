package com.canchapp.CanchAPP_Back.controller;

import com.canchapp.CanchAPP_Back.dto.ApiResponse;
import com.canchapp.CanchAPP_Back.dto.CanchaDTO;
import com.canchapp.CanchAPP_Back.dto.EstablecimientoDTO;
import com.canchapp.CanchAPP_Back.dto.ResponseService;
import com.canchapp.CanchAPP_Back.service.interfaces.CanchaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Tag(name = "Cancha Controller", description = "Operaciones para la tabla cancha del esquema general")
@RequestMapping("/v1/api/cancha")
@CrossOrigin(origins = "*", methods = {RequestMethod.DELETE, RequestMethod.GET, RequestMethod.POST,RequestMethod.PUT})
public class CanchaController {

  @Autowired
  private CanchaService canchaService;

  @Autowired
  private ResponseService responseService;

  @GetMapping
  @Operation(summary = "Get", description = "Consultar todas las cnachas")
  public ResponseEntity<ApiResponse<List<CanchaDTO>>> obtenerTodos() {
    List<CanchaDTO> canchas = canchaService.obtenerTodos();
    ApiResponse<List<CanchaDTO>> response = responseService.createResponse(canchas, "retrieve");
    return ResponseEntity.ok(response);
  }

  @GetMapping("/{id}")
  @Operation(summary = "Get by ID", description = "Consultar cnacha por su ID")
  public ResponseEntity<ApiResponse<CanchaDTO>> obtenerPorId(@PathVariable Integer id) {
    CanchaDTO cancha = canchaService.obtenerPorId(id);
    ApiResponse<CanchaDTO> response = responseService.createResponse(cancha, "retrieve");
    return ResponseEntity.ok(response);
  }

  // --- MÉTODO 4: CREAR CANCHA ---
  @PostMapping
  @Operation(summary = "Create", description = "Crear una nueva cancha vinculándola al ID de un establecimiento")
  public ResponseEntity<ApiResponse<CanchaDTO>> crearCancha(@RequestBody CanchaDTO canchaDTO) {
    CanchaDTO nuevaCancha = canchaService.crearCancha(canchaDTO);
    ApiResponse<CanchaDTO> response = responseService.createResponse(nuevaCancha, "create");
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  // --- MÉTODO 5: ACTUALIZAR CANCHA ---
  @PutMapping("/{id}")
  @Operation(summary = "Update", description = "Actualizar el código o estado de una cancha existente")
  public ResponseEntity<ApiResponse<CanchaDTO>> actualizarCancha(@PathVariable Integer id, @RequestBody CanchaDTO canchaDTO) {
    CanchaDTO canchaActualizada = canchaService.actualizarCancha(id, canchaDTO);
    ApiResponse<CanchaDTO> response = responseService.createResponse(canchaActualizada, "update");
    return ResponseEntity.ok(response);
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Delete", description = "Eliminar (desactivar) una cancha por su ID")
  public ResponseEntity<ApiResponse<Void>> eliminarCancha(@PathVariable Integer id) {
    canchaService.eliminarCancha(id);
    ApiResponse<Void> response = responseService.createResponse(null, "delete");
    return ResponseEntity.ok(response);
  }

  @PutMapping("/{id}/activar")
  @Operation(summary = "Reactivate", description = "Vuelve a activar una cancha que fue eliminada lógicamente")
  public ResponseEntity<ApiResponse<Void>> activarCancha(@PathVariable Integer id) {
    canchaService.activarCancha(id);
    ApiResponse<Void> response = responseService.createResponse(null, "update");
    return ResponseEntity.ok(response);
  }


  @GetMapping("/establecimiento/{establecimientoId}")
  @Operation(summary = "Get by Establecimiento", description = "Lista todas las canchas de un establecimiento específico")
  public ResponseEntity<ApiResponse<List<CanchaDTO>>> obtenerCanchasPorEstablecimiento(@PathVariable Integer establecimientoId) {

    List<CanchaDTO> canchas = canchaService.obtenerPorEstablecimiento(establecimientoId);
    ApiResponse<List<CanchaDTO>> response = responseService.createResponse(canchas, "retrieve");

    return ResponseEntity.ok(response);
  }

}
