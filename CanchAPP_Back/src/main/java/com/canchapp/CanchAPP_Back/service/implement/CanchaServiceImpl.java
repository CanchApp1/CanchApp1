package com.canchapp.CanchAPP_Back.service.implement;

import com.canchapp.CanchAPP_Back.dto.CanchaDTO;
import com.canchapp.CanchAPP_Back.model.Cancha;
import com.canchapp.CanchAPP_Back.model.Establecimiento;
import com.canchapp.CanchAPP_Back.repository.CanchaRepository;
import com.canchapp.CanchAPP_Back.repository.EstablecimientoRepository;
import com.canchapp.CanchAPP_Back.service.interfaces.CanchaService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CanchaServiceImpl implements CanchaService {

  private final CanchaRepository canchaRepository;
  private final EstablecimientoRepository establecimientoRepository;
  private final ModelMapper modelMapper;

  @Override
  public List<CanchaDTO> obtenerTodos() {
    List<CanchaDTO> canchas = canchaRepository.findByEstadoActivoTrue()
      .stream()
      .map(cancha -> modelMapper.map(cancha, CanchaDTO.class))
      .collect(Collectors.toList());
    return canchas;
  }

  @Override
  public CanchaDTO obtenerPorId(Integer id) {
    return canchaRepository.findById(id)
      .map(cancha -> modelMapper.map(cancha, CanchaDTO.class))
      .orElseThrow(() -> new RuntimeException("Establecimiento con ID " + id + " no encontrado"));
  }

  @Override
  @Transactional
  public CanchaDTO crearCancha(CanchaDTO canchaDTO) {
    try {
      // Validar que venga la información del establecimiento
      if (canchaDTO.getEstablecimiento() == null || canchaDTO.getEstablecimiento().getEstablecimientoId() == null) {
        throw new RuntimeException("El ID del establecimiento es obligatorio para crear una cancha");
      }

      // REGLA DE NEGOCIO: Validar que el precio venga y no sea negativo
      if (canchaDTO.getPrecioPorHora() == null || canchaDTO.getPrecioPorHora() < 0) {
        throw new RuntimeException("El precio por hora es obligatorio y no puede ser negativo");
      }
      Integer idEstablecimiento = canchaDTO.getEstablecimiento().getEstablecimientoId();
      // Validamos si ya existe ese código/nombre en este establecimiento específico
      boolean existeCancha = canchaRepository.existsByEstablecimiento_EstablecimientoIdAndCodigoIgnoreCase(
        idEstablecimiento, canchaDTO.getCodigo());

      if (existeCancha) {
        throw new RuntimeException("El establecimiento ya tiene registrada una cancha con el nombre/código: '" + canchaDTO.getCodigo() + "'");
      }

      // Buscar el establecimiento en la Base de Datos
      Establecimiento establecimientoExistente = establecimientoRepository.findById(idEstablecimiento)
        .orElseThrow(() -> new RuntimeException("Establecimiento no encontrado con ID: " + idEstablecimiento));

      Cancha nuevaCancha = new Cancha();
      nuevaCancha.setCodigo(canchaDTO.getCodigo());

      // AGREGAMOS EL GUARDADO DEL PRECIO
      nuevaCancha.setPrecioPorHora(canchaDTO.getPrecioPorHora());

      // Si no envian estado, le ponemos uno por defecto ("DISPONIBLE")
      nuevaCancha.setEstado(canchaDTO.getEstado() != null ? canchaDTO.getEstado() : "DISPONIBLE");
      nuevaCancha.setEstablecimiento(establecimientoExistente);
      nuevaCancha.setEstadoActivo(true);
      nuevaCancha.setFechaCreacion(LocalDateTime.now());

      String usuarioCreador = SecurityContextHolder.getContext().getAuthentication().getName();
      nuevaCancha.setUsuarioCreacion(usuarioCreador);

      Cancha canchaGuardada = canchaRepository.save(nuevaCancha);
      return modelMapper.map(canchaGuardada, CanchaDTO.class);

    } catch (Exception e) {
      System.out.println("Error al crear la cancha: " + e.getMessage());
      throw new RuntimeException("Error al crear la cancha: " + e.getMessage());
    }
  }

  @Override
  public CanchaDTO actualizarCancha(Integer id, CanchaDTO canchaDTO) {
    try {
      // Buscamos la cancha existente
      Cancha canchaExistente = canchaRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Cancha no encontrada con el ID: " + id));

      if (canchaDTO.getCodigo() != null) {

        //Verificamos si realmente le están cambiando el nombre
        if (!canchaDTO.getCodigo().equalsIgnoreCase(canchaExistente.getCodigo())) {

          //Extraemos el ID del establecimiento de la cancha que ya tenemos en BD
          Integer idEstablecimiento = canchaExistente.getEstablecimiento().getEstablecimientoId();

          //Validamos si ese NUEVO nombre ya está ocupado por otra cancha
          boolean existeCancha = canchaRepository.existsByEstablecimiento_EstablecimientoIdAndCodigoIgnoreCase(
            idEstablecimiento, canchaDTO.getCodigo());

          if (existeCancha) {
            throw new RuntimeException("El establecimiento ya tiene otra cancha con el nombre/código: '" + canchaDTO.getCodigo() + "'");
          }
        }
        //Si pasó las validaciones (o si era el mismo nombre), lo actualizamos
        canchaExistente.setCodigo(canchaDTO.getCodigo());
      }

      if (canchaDTO.getEstado() != null) {
        canchaExistente.setEstado(canchaDTO.getEstado());
      }

      // AGREGAMOS LA ACTUALIZACIÓN DEL PRECIO
      if (canchaDTO.getPrecioPorHora() != null) {
        if (canchaDTO.getPrecioPorHora() < 0) {
          throw new RuntimeException("El precio por hora no puede ser negativo");
        }
        canchaExistente.setPrecioPorHora(canchaDTO.getPrecioPorHora());
      }

      // Registramos quién y cuándo la modificó
      canchaExistente.setFechaModificacion(LocalDateTime.now());
      String usuarioModificador = SecurityContextHolder.getContext().getAuthentication().getName();
      canchaExistente.setUsuarioModificacion(usuarioModificador);

      Cancha canchaActualizada = canchaRepository.save(canchaExistente);
      return modelMapper.map(canchaActualizada, CanchaDTO.class);

    } catch (Exception e) {
      System.out.println("Error al actualizar la cancha: " + e.getMessage());
      throw new RuntimeException("Error al actualizar la cancha: " + e.getMessage());
    }
  }

  @Override
  public Void eliminarCancha(Integer id) {
    try {
      Cancha cancha = canchaRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Cancha no encontrada con el ID: " + id));

      //Solo cambiamos el estado a falso (inactivo)
      cancha.setEstadoActivo(false);
      // registramos quién lo eliminó
      String usuarioModificador = SecurityContextHolder.getContext().getAuthentication().getName();
      cancha.setUsuarioModificacion(usuarioModificador);
      cancha.setFechaModificacion(LocalDateTime.now());
      //guardamos los cambios
      canchaRepository.save(cancha);

      return null;

    } catch (Exception e) {
      System.out.println("Error al eliminar la cancha: " + e.getMessage());
      throw new RuntimeException("Error al eliminar: " + e.getMessage());
    }
  }

  @Override
  public Void activarCancha(Integer id) {
    try {
      Cancha cancha = canchaRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Cancha no encontrada con el ID: " + id));

      cancha.setEstadoActivo(true);
      String usuarioModificador = SecurityContextHolder.getContext().getAuthentication().getName();
      cancha.setUsuarioModificacion(usuarioModificador);
      canchaRepository.save(cancha);

      return null;

    } catch (Exception e) {
      System.out.println("Error al activar la cancha: " + e.getMessage());
      throw new RuntimeException("Error al activar: " + e.getMessage());
    }
  }

  @Override
  public List<CanchaDTO> obtenerPorEstablecimiento(Integer establecimientoId) {
    if (!establecimientoRepository.existsById(establecimientoId)) {
      throw new RuntimeException("Establecimiento no encontrado con ID: " + establecimientoId);
    }

    // 👇 Cambiamos el método por el que filtra por estado activo
    List<Cancha> canchas = canchaRepository.findByEstablecimiento_EstablecimientoIdAndEstadoActivoTrue(establecimientoId);

    return canchas.stream()
      .map(cancha -> modelMapper.map(cancha, CanchaDTO.class))
      .collect(Collectors.toList());
  }
}
