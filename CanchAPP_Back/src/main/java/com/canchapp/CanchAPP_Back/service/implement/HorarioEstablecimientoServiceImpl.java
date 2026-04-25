package com.canchapp.CanchAPP_Back.service.implement;

import com.canchapp.CanchAPP_Back.dto.HorarioEstablecimientoDTO;
import com.canchapp.CanchAPP_Back.model.Establecimiento;
import com.canchapp.CanchAPP_Back.model.HorarioEstablecimiento;
import com.canchapp.CanchAPP_Back.repository.EstablecimientoRepository;
import com.canchapp.CanchAPP_Back.repository.HorarioEstablecimientoRepository;
import com.canchapp.CanchAPP_Back.service.interfaces.HorarioEstablecimientoService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HorarioEstablecimientoServiceImpl implements HorarioEstablecimientoService {

  private final HorarioEstablecimientoRepository horarioRepository;
  private final EstablecimientoRepository establecimientoRepository;
  private final ModelMapper modelMapper;


  @Override
  public List<HorarioEstablecimientoDTO> obtenerPorEstablecimiento(Integer establecimientoId) {
    List<HorarioEstablecimiento> horarios = horarioRepository
      .findByEstablecimiento_EstablecimientoIdAndEstadoActivoTrue(establecimientoId);

    return horarios.stream()
      .map(horario -> modelMapper.map(horario, HorarioEstablecimientoDTO.class))
      .collect(Collectors.toList());
  }

  @Override
  @Transactional
  public HorarioEstablecimientoDTO crearHorario(HorarioEstablecimientoDTO horarioDTO) {
    //Validar establecimiento
    Integer idEstablecimiento = horarioDTO.getEstablecimiento().getEstablecimientoId();
    Establecimiento establecimiento = establecimientoRepository.findById(idEstablecimiento)
      .orElseThrow(() -> new RuntimeException("Establecimiento no encontrado"));

    //Regla de Negocio: Validar que no exista un horario para ese día
    Optional<HorarioEstablecimiento> horarioExistente = horarioRepository
      .findByEstablecimiento_EstablecimientoIdAndDiaSemanaAndEstadoActivoTrue(idEstablecimiento, horarioDTO.getDiaSemana());

    if (horarioExistente.isPresent()) {
      throw new RuntimeException("Ya existe un horario configurado para el día: " + horarioDTO.getDiaSemana());
    }

    //Crear y mapear
    HorarioEstablecimiento nuevoHorario = new HorarioEstablecimiento();
    nuevoHorario.setEstablecimiento(establecimiento);
    nuevoHorario.setDiaSemana(horarioDTO.getDiaSemana().toUpperCase()); // Aseguramos mayúsculas
    nuevoHorario.setHoraApertura(horarioDTO.getHoraApertura());
    nuevoHorario.setHoraCierre(horarioDTO.getHoraCierre());
    nuevoHorario.setCerradoTodoElDia(horarioDTO.getCerradoTodoElDia() != null ? horarioDTO.getCerradoTodoElDia() : false);

    //Auditoría
    nuevoHorario.setEstadoActivo(true);
    nuevoHorario.setFechaCreacion(LocalDateTime.now());
    nuevoHorario.setUsuarioCreacion(SecurityContextHolder.getContext().getAuthentication().getName());

    return modelMapper.map(horarioRepository.save(nuevoHorario), HorarioEstablecimientoDTO.class);
  }

  @Override
  @Transactional
  public HorarioEstablecimientoDTO actualizarHorario(Integer id, HorarioEstablecimientoDTO horarioDTO) {
    HorarioEstablecimiento horario = horarioRepository.findById(id)
      .orElseThrow(() -> new RuntimeException("Horario no encontrado"));

    // Solo actualizamos horas y si está cerrado (el día y el establecimiento no cambian)
    if (horarioDTO.getHoraApertura() != null) horario.setHoraApertura(horarioDTO.getHoraApertura());
    if (horarioDTO.getHoraCierre() != null) horario.setHoraCierre(horarioDTO.getHoraCierre());
    if (horarioDTO.getCerradoTodoElDia() != null) horario.setCerradoTodoElDia(horarioDTO.getCerradoTodoElDia());

    horario.setFechaModificacion(LocalDateTime.now());
    horario.setUsuarioModificacion(SecurityContextHolder.getContext().getAuthentication().getName());

    return modelMapper.map(horarioRepository.save(horario), HorarioEstablecimientoDTO.class);
  }

  @Override
  @Transactional
  public Void eliminarHorario(Integer id) {
    HorarioEstablecimiento horario = horarioRepository.findById(id)
      .orElseThrow(() -> new RuntimeException("Horario no encontrado"));

    horario.setEstadoActivo(false); // Borrado lógico
    horario.setFechaModificacion(LocalDateTime.now());
    horario.setUsuarioModificacion(SecurityContextHolder.getContext().getAuthentication().getName());

    horarioRepository.save(horario);
    return null;
  }

  @Override
  @Transactional
  public List<HorarioEstablecimientoDTO> crearHorariosEnLote(List<HorarioEstablecimientoDTO> horariosDTO) {
    try {
      if (horariosDTO == null || horariosDTO.isEmpty()) {
        throw new RuntimeException("La lista de horarios no puede estar vacía");
      }

      Integer idEstablecimiento = horariosDTO.get(0).getEstablecimiento().getEstablecimientoId();

      // Buscamos el establecimiento una sola vez para optimizar
      Establecimiento establecimiento = establecimientoRepository.findById(idEstablecimiento)
        .orElseThrow(() -> new RuntimeException("Establecimiento no encontrado con ID: " + idEstablecimiento));

      String usuarioCreador = SecurityContextHolder.getContext().getAuthentication().getName();
      LocalDateTime ahora = LocalDateTime.now();

      // Mapeamos toda la lista a entidades
      List<HorarioEstablecimiento> entidadesAGuardar = horariosDTO.stream().map(dto -> {
        HorarioEstablecimiento horario = new HorarioEstablecimiento();
        horario.setEstablecimiento(establecimiento);
        horario.setDiaSemana(dto.getDiaSemana());
        horario.setHoraApertura(dto.getHoraApertura());
        horario.setHoraCierre(dto.getHoraCierre());
        horario.setCerradoTodoElDia(dto.getCerradoTodoElDia());

        horario.setUsuarioCreacion(usuarioCreador);
        horario.setFechaCreacion(ahora);
        horario.setEstadoActivo(true);
        return horario;
      }).toList();

      // Guardamos todos de un solo golpe
      List<HorarioEstablecimiento> horariosGuardados = horarioRepository.saveAll(entidadesAGuardar);

      return horariosGuardados.stream()
        .map(h -> modelMapper.map(h, HorarioEstablecimientoDTO.class))
        .toList();

    } catch (Exception e) {
      System.out.println("Error al crear los horarios en lote: " + e.getMessage());
      throw new RuntimeException("Error al crear los horarios: " + e.getMessage());
    }
  }
}
