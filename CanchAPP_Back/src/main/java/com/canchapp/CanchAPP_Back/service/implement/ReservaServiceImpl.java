package com.canchapp.CanchAPP_Back.service.implement;

import com.canchapp.CanchAPP_Back.dto.ReservaDTO;
import com.canchapp.CanchAPP_Back.model.Cancha;
import com.canchapp.CanchAPP_Back.model.HorarioEstablecimiento;
import com.canchapp.CanchAPP_Back.model.Reserva;
import com.canchapp.CanchAPP_Back.model.Usuario; // Asumiendo tu clase Usuario
import com.canchapp.CanchAPP_Back.repository.CanchaRepository;
import com.canchapp.CanchAPP_Back.repository.HorarioEstablecimientoRepository;
import com.canchapp.CanchAPP_Back.repository.ReservaRepository;
// import com.canchapp.CanchAPP_Back.repository.UsuarioRepository; // Necesario para crearReserva
import com.canchapp.CanchAPP_Back.repository.UsuarioRepository;
import com.canchapp.CanchAPP_Back.service.interfaces.ReservaService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReservaServiceImpl implements ReservaService {

  private final ReservaRepository reservaRepository;
  private final CanchaRepository canchaRepository;
  private final HorarioEstablecimientoRepository horarioRepository;
  private final UsuarioRepository usuarioRepository;
  private final ModelMapper modelMapper;

  // el tiempo mínimo para alquilar es de 1 hora (60 minutos)
  private final int INTERVALO_MINUTOS = 60;

  // OBTENER HORAS DE INICIO DISPONIBLES
  @Override
  public List<LocalTime> obtenerHorasDisponiblesParaInicio(Integer canchaId, LocalDate fecha) {
    // validar si el establecimiento abre ese día
    HorarioEstablecimiento horario = obtenerHorarioDelDia(canchaId, fecha);
    if (horario == null || horario.getCerradoTodoElDia()) {
      return new ArrayList<>(); // Retorna lista vacía (no hay horas disponibles)
    }

    //Traer las reservas de ese día para esa cancha
    List<Reserva> reservasDelDia = reservaRepository.findByCancha_CanchaIdAndFechaAndEstadoActivoTrueAndEstadoReservaNot(
      canchaId, fecha, "CANCELADA");

    List<LocalTime> horasDisponibles = new ArrayList<>();
    LocalTime horaIterador = horario.getHoraApertura();

    // 3. Recorremos desde la apertura hasta el cierre en bloques de 1 hora
    while (horaIterador.isBefore(horario.getHoraCierre())) {
      LocalTime posibleFin = horaIterador.plusMinutes(INTERVALO_MINUTOS);

      // Verificamos si este bloque choca con alguna reserva existente
      boolean choca = false;
      for (Reserva reserva : reservasDelDia) {
        // Fórmula de choque: Inicio_A < Fin_B AND Fin_A > Inicio_B
        if (horaIterador.isBefore(reserva.getHoraFin()) && posibleFin.isAfter(reserva.getHoraInicio())) {
          choca = true;
          break;
        }
      }

      if (!choca) {
        horasDisponibles.add(horaIterador);
      }

      horaIterador = horaIterador.plusMinutes(INTERVALO_MINUTOS); // Avanzamos 1 hora
    }

    return horasDisponibles;
  }

  //OBTENER HORAS DE FIN DISPONIBLES (Continuidad de tiempo)
  @Override
  public List<LocalTime> obtenerHorasDisponiblesParaFin(Integer canchaId, LocalDate fecha, LocalTime horaInicio) {
    HorarioEstablecimiento horario = obtenerHorarioDelDia(canchaId, fecha);
    if (horario == null || horario.getCerradoTodoElDia()) return new ArrayList<>();

    List<Reserva> reservasDelDia = reservaRepository.findByCancha_CanchaIdAndFechaAndEstadoActivoTrueAndEstadoReservaNot(
      canchaId, fecha, "CANCELADA");

    // Buscamos cuál es la próxima reserva que empieza DESPUÉS de nuestra hora de inicio
    LocalTime limiteMaximo = horario.getHoraCierre(); // Por defecto, el límite es cuando cierran

    for (Reserva reserva : reservasDelDia) {
      // Si encontramos una reserva que empieza igual o después de la nuestra
      if (!reserva.getHoraInicio().isBefore(horaInicio)) {
        // Y está antes de nuestro límite actual
        if (reserva.getHoraInicio().isBefore(limiteMaximo)) {
          limiteMaximo = reserva.getHoraInicio(); // Recortamos el límite
        }
      }
    }

    // Ahora generamos la lista de horas fin desde (horaInicio + 1 hr) hasta el limiteMaximo
    List<LocalTime> horasFinDisponibles = new ArrayList<>();
    LocalTime horaIterador = horaInicio.plusMinutes(INTERVALO_MINUTOS);

    // <= límite porque la hora fin PUEDE ser exactamente la hora en que empieza el siguiente partido
    while (!horaIterador.isAfter(limiteMaximo)) {
      horasFinDisponibles.add(horaIterador);
      horaIterador = horaIterador.plusMinutes(INTERVALO_MINUTOS);
    }

    return horasFinDisponibles;
  }


  // CREAR LA RESERVA
  @Override
  @Transactional
  public ReservaDTO crearReserva(ReservaDTO reservaDTO) {
    // Validar que la hora fin sea después de la hora inicio
    if (!reservaDTO.getHoraFin().isAfter(reservaDTO.getHoraInicio())) {
      throw new RuntimeException("La hora de fin debe ser posterior a la hora de inicio");
    }

    // Usar nuestra consulta SQL Mágica del Repositorio para la doble validación final
    Integer idCancha = reservaDTO.getCancha().getCanchaId();
    boolean existeCruce = reservaRepository.existeCruceDeHorarios(
      idCancha, reservaDTO.getFecha(), reservaDTO.getHoraInicio(), reservaDTO.getHoraFin());

    if (existeCruce) {
      throw new RuntimeException("La cancha ya se encuentra reservada en este bloque horario.");
    }

    // Buscar Usuario y Cancha en la BD
    Usuario usuario = usuarioRepository.findById(reservaDTO.getUsuario().getIdUsuario())
      .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    Cancha cancha = canchaRepository.findById(idCancha)
      .orElseThrow(() -> new RuntimeException("Cancha no encontrada"));

    // Mapear y Guardar
    Reserva nuevaReserva = new Reserva();
    nuevaReserva.setUsuario(usuario);
    nuevaReserva.setCancha(cancha);
    nuevaReserva.setFecha(reservaDTO.getFecha());
    nuevaReserva.setHoraInicio(reservaDTO.getHoraInicio());
    nuevaReserva.setHoraFin(reservaDTO.getHoraFin());
    nuevaReserva.setDescripcion(reservaDTO.getDescripcion());
    nuevaReserva.setEstadoReserva("PENDIENTE_PAGO"); // Bloqueamos la cancha, pero aún no está pagada

    // Auditoría
    nuevaReserva.setEstadoActivo(true);
    nuevaReserva.setFechaCreacion(LocalDateTime.now());
    nuevaReserva.setUsuarioCreacion(SecurityContextHolder.getContext().getAuthentication().getName());

    return modelMapper.map(reservaRepository.save(nuevaReserva), ReservaDTO.class);
  }


  private HorarioEstablecimiento obtenerHorarioDelDia(Integer canchaId, LocalDate fecha) {
    Cancha cancha = canchaRepository.findById(canchaId)
      .orElseThrow(() -> new RuntimeException("Cancha no encontrada"));

    Integer establecimientoId = cancha.getEstablecimiento().getEstablecimientoId();
    String diaSemana = fecha.getDayOfWeek().name(); // Ej: "MONDAY"

    return horarioRepository.findByEstablecimiento_EstablecimientoIdAndDiaSemanaAndEstadoActivoTrue(
      establecimientoId, diaSemana).orElse(null);
  }

  @Override
  public List<ReservaDTO> obtenerPorEstablecimiento(Integer establecimientoId) {
    List<Reserva> reservas = reservaRepository.findByCancha_Establecimiento_EstablecimientoIdAndEstadoActivoTrue(establecimientoId);

    // Mapeamos la lista de Entidades a DTOs
    List<ReservaDTO> reservasDTO = new ArrayList<>();
    for (Reserva r : reservas) {
      reservasDTO.add(modelMapper.map(r, ReservaDTO.class));
    }
    return reservasDTO;
  }

  @Override
  @Transactional
  public ReservaDTO actualizarReserva(Integer id, ReservaDTO reservaDTO) {
    Reserva reservaExistente = reservaRepository.findById(id)
      .orElseThrow(() -> new RuntimeException("Reserva no encontrada con ID: " + id));

    // Regla de Arquitectura: Por seguridad, normalmente solo dejamos modificar el estado o la descripción.
    // Si quieren cambiar la hora o la cancha, lo ideal es CANCELAR esta y crear una nueva,
    // para no romper las validaciones de cruce de horarios que ya hicimos.

    if (reservaDTO.getEstadoReserva() != null) {
      reservaExistente.setEstadoReserva(reservaDTO.getEstadoReserva()); // Ej: Pasarla a "CANCELADA"
    }
    if (reservaDTO.getDescripcion() != null) {
      reservaExistente.setDescripcion(reservaDTO.getDescripcion());
    }

    // Auditoría
    reservaExistente.setFechaModificacion(LocalDateTime.now());
    reservaExistente.setUsuarioModificacion(SecurityContextHolder.getContext().getAuthentication().getName());

    return modelMapper.map(reservaRepository.save(reservaExistente), ReservaDTO.class);
  }

  // --- 6. HISTORIAL DE RESERVAS POR USUARIO ---
  @Override
  public List<ReservaDTO> obtenerHistorialPorUsuario(Integer idUsuario) {
    // Buscamos en la base de datos con nuestro nuevo método ordenado
    List<Reserva> historial = reservaRepository
      .findByUsuario_UsuarioIdAndEstadoActivoTrueOrderByFechaDescHoraInicioDesc(idUsuario);

    // Mapeamos la lista de Entidades a una lista de DTOs usando Streams (código moderno y limpio)
    List<ReservaDTO> historialDTO = new ArrayList<>();
    for (Reserva reserva : historial) {
      historialDTO.add(modelMapper.map(reserva, ReservaDTO.class));
    }

    return historialDTO;
  }
}
