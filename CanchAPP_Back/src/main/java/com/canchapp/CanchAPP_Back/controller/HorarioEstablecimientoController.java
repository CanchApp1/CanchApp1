package com.canchapp.CanchAPP_Back.controller;

import com.canchapp.CanchAPP_Back.dto.ApiResponse;
import com.canchapp.CanchAPP_Back.dto.HorarioEstablecimientoDTO;
import com.canchapp.CanchAPP_Back.dto.ResponseService;
import com.canchapp.CanchAPP_Back.service.interfaces.HorarioEstablecimientoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/api/horario")
@Tag(name = "Horario Establecimiento", description = "Gestión de los horarios de apertura y cierre por día")
@CrossOrigin(origins = "*", methods = {RequestMethod.DELETE, RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT})
@RequiredArgsConstructor
public class HorarioEstablecimientoController {

  private final HorarioEstablecimientoService horarioService;
  private final ResponseService responseService;

  @GetMapping("/establecimiento/{establecimientoId}")
  @Operation(summary = "Get by Establecimiento", description = "Obtener el horario de toda la semana de un establecimiento")
  public ResponseEntity<ApiResponse<List<HorarioEstablecimientoDTO>>> obtenerPorEstablecimiento(@PathVariable Integer establecimientoId) {
    List<HorarioEstablecimientoDTO> horarios = horarioService.obtenerPorEstablecimiento(establecimientoId);
    return ResponseEntity.ok(responseService.createResponse(horarios, "retrieve"));
  }

  @PostMapping
  @Operation(summary = "Create", description = "Crear el horario para un día específico")
  public ResponseEntity<ApiResponse<HorarioEstablecimientoDTO>> crearHorario(@RequestBody HorarioEstablecimientoDTO horarioDTO) {
    HorarioEstablecimientoDTO nuevoHorario = horarioService.crearHorario(horarioDTO);
    return ResponseEntity.status(HttpStatus.CREATED).body(responseService.createResponse(nuevoHorario, "create"));
  }

  @PutMapping("/{id}")
  @Operation(summary = "Update", description = "Actualizar las horas de apertura/cierre de un día")
  public ResponseEntity<ApiResponse<HorarioEstablecimientoDTO>> actualizarHorario(@PathVariable Integer id, @RequestBody HorarioEstablecimientoDTO horarioDTO) {
    HorarioEstablecimientoDTO horarioActualizado = horarioService.actualizarHorario(id, horarioDTO);
    return ResponseEntity.ok(responseService.createResponse(horarioActualizado, "update"));
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Delete", description = "Eliminar (desactivar) el horario de un día")
  public ResponseEntity<ApiResponse<Void>> eliminarHorario(@PathVariable Integer id) {
    horarioService.eliminarHorario(id);
    return ResponseEntity.ok(responseService.createResponse(null, "delete"));
  }

  @PostMapping("/lote")
  public ResponseEntity<List<HorarioEstablecimientoDTO>> crearHorariosEnLote(
    @RequestBody List<HorarioEstablecimientoDTO> horariosDTO) {

    List<HorarioEstablecimientoDTO> horariosGuardados = horarioService.crearHorariosEnLote(horariosDTO);
    return ResponseEntity.ok(horariosGuardados);
  }

}
