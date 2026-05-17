package com.canchapp.CanchAPP_Back.controller;

import com.canchapp.CanchAPP_Back.dto.DueloDTO;
import com.canchapp.CanchAPP_Back.service.interfaces.DueloService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/duelos")
@Tag(name = "Duelos Controller", description = "Operaciones para la tabla duelos del esquema general")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", methods = {RequestMethod.DELETE, RequestMethod.GET, RequestMethod.POST,RequestMethod.PUT})
public class DueloController {

  private final DueloService dueloService;

  @PostMapping("/publicar")
  @Operation(summary = "Publicar un nuevo duelo", description = "Publicar un nuevo duelo (El creador paga su 50% y bloquea la cancha)")
  public ResponseEntity<DueloDTO> publicarDuelo(@RequestBody DueloDTO dueloDTO) {
    DueloDTO nuevoDuelo = dueloService.publicarDuelo(dueloDTO);
    return new ResponseEntity<>(nuevoDuelo, HttpStatus.CREATED);
  }

  @GetMapping("/disponibles")
  @Operation(summary = "Listar todos los duelos activos", description = "Listar todos los duelos activos en el tablero público")
  public ResponseEntity<List<DueloDTO>> listarDuelosDisponibles() {
    List<DueloDTO> duelos = dueloService.listarDuelosDisponibles();
    return new ResponseEntity<>(duelos, HttpStatus.OK);
  }

  @GetMapping("/{id}")
  @Operation(summary = "Ver el detalle de un duelo específico", description = "Ver el detalle de un duelo específico (para ver si ya alguien lo aceptó, pagos, etc.)")
  public ResponseEntity<DueloDTO> obtenerDetalleDuelo(@PathVariable Integer id) {
    DueloDTO duelo = dueloService.obtenerDetalleDuelo(id);
    return new ResponseEntity<>(duelo, HttpStatus.OK);
  }

  @PostMapping("/{id}/aceptar")
  @Operation(summary = "Aceptar un duelo existente", description = "El oponente paga su 50% y se confirma el partido")
  public ResponseEntity<DueloDTO> aceptarDuelo(
    @PathVariable Integer id,
    @RequestParam String stripePaymentId) { // Recibimos el ID del pago como parámetro

    DueloDTO dueloConfirmado = dueloService.aceptarDuelo(id, stripePaymentId);
    return new ResponseEntity<>(dueloConfirmado, HttpStatus.OK);
  }
}
