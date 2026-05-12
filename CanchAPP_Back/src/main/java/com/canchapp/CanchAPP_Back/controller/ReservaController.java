package com.canchapp.CanchAPP_Back.controller;

import com.canchapp.CanchAPP_Back.dto.ApiResponse;
import com.canchapp.CanchAPP_Back.dto.ReservaDTO;
import com.canchapp.CanchAPP_Back.dto.ResponseService;
import com.canchapp.CanchAPP_Back.service.interfaces.ReservaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/v1/api/reserva")
@Tag(name = "Reserva Controller", description = "Gestión de reservas y cálculo dinámico de disponibilidad")
@CrossOrigin(origins = "*", methods = {RequestMethod.DELETE, RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT})
@RequiredArgsConstructor
public class ReservaController {

  private final ReservaService reservaService;
  private final ResponseService responseService;

  // OBTENER HORAS DE INICIO
  @GetMapping("/disponibles/inicio")
  @Operation(summary = "Horas de Inicio Disponibles", description = "Devuelve las horas a las que se puede iniciar un partido en una fecha específica")
  public ResponseEntity<ApiResponse<List<LocalTime>>> obtenerHorasInicio(
    @RequestParam Integer canchaId,
    @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate fecha) {

    List<LocalTime> horas = reservaService.obtenerHorasDisponiblesParaInicio(canchaId, fecha);
    return ResponseEntity.ok(responseService.createResponse(horas, "retrieve"));
  }

  //OBTENER HORAS DE FIN
  @GetMapping("/disponibles/fin")
  @Operation(summary = "Horas de Fin Disponibles", description = "Devuelve hasta qué hora se puede extender un partido según la hora de inicio seleccionada")
  public ResponseEntity<ApiResponse<List<LocalTime>>> obtenerHorasFin(
    @RequestParam Integer canchaId,
    @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate fecha,
    @RequestParam @DateTimeFormat(pattern = "HH:mm") LocalTime horaInicio) {

    List<LocalTime> horas = reservaService.obtenerHorasDisponiblesParaFin(canchaId, fecha, horaInicio);
    return ResponseEntity.ok(responseService.createResponse(horas, "retrieve"));
  }

  //CREAR LA RESERVA
  @PostMapping
  @Operation(summary = "Crear Reserva", description = "Registra una nueva reserva validando que no haya cruces de horarios")
  public ResponseEntity<ApiResponse<ReservaDTO>> crearReserva(@RequestBody ReservaDTO reservaDTO) {
    ReservaDTO nuevaReserva = reservaService.crearReserva(reservaDTO);
    return ResponseEntity.status(HttpStatus.CREATED).body(responseService.createResponse(nuevaReserva, "create"));
  }

  //4. OBTENER POR ESTABLECIMIENTO
  @GetMapping("/establecimiento/{establecimientoId}")
  @Operation(summary = "Get by Establecimiento", description = "Obtiene todas las reservas de todas las canchas de un establecimiento")
  public ResponseEntity<ApiResponse<List<ReservaDTO>>> obtenerPorEstablecimiento(@PathVariable Integer establecimientoId) {
    List<ReservaDTO> reservas = reservaService.obtenerPorEstablecimiento(establecimientoId);
    return ResponseEntity.ok(responseService.createResponse(reservas, "retrieve"));
  }

  //5. MODIFICAR RESERVA (EJ: CANCELARLA)
  @PutMapping("/{id}")
  @Operation(summary = "Update Reserva", description = "Actualiza el estado o descripción de una reserva")
  public ResponseEntity<ApiResponse<ReservaDTO>> actualizarReserva(@PathVariable Integer id, @RequestBody ReservaDTO reservaDTO) {
    ReservaDTO reservaActualizada = reservaService.actualizarReserva(id, reservaDTO);
    return ResponseEntity.ok(responseService.createResponse(reservaActualizada, "update"));
  }

  //6. HISTORIAL POR USUARIO
  @GetMapping("/historial/usuario/{idUsuario}")
  @Operation(summary = "Historial por Usuario", description = "Obtiene todas las reservas (pasadas y futuras) de un usuario ordenadas por fecha")
  public ResponseEntity<ApiResponse<List<ReservaDTO>>> obtenerHistorialUsuario(@PathVariable Integer idUsuario) {
    List<ReservaDTO> historial = reservaService.obtenerHistorialPorUsuario(idUsuario);
    return ResponseEntity.ok(responseService.createResponse(historial, "retrieve"));
  }

  //Endpoint para crear una reserva manualmente por el Administrador (Sin pasarela de pago)
  @PostMapping("/admin")
  @Operation(summary = "Reserva Admim", description = "Endpoint para crear una reserva manualmente por el Administrador (Sin pasarela de pago)")
  public ResponseEntity<ReservaDTO> crearReservaAdmin(@RequestBody ReservaDTO reservaDTO) {
    ReservaDTO nuevaReserva = reservaService.crearReservaAdmin(reservaDTO);
    return ResponseEntity.ok(nuevaReserva);
  }


  //Endpoint para listar las reservas de una cancha en específico.
  // Protegido: Solo el dueño de la cancha puede verlas.
  @GetMapping("/cancha/{canchaId}")
  @Operation(summary = "Historial por cancha", description = "Obtiene todas las reservas (pasadas y futuras) de una cancha especifica")
  public ResponseEntity<List<ReservaDTO>> listarPorCancha(@PathVariable Integer canchaId) {
    return ResponseEntity.ok(reservaService.obtenerPorCancha(canchaId));
  }
}
