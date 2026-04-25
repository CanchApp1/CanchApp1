package com.canchapp.CanchAPP_Back.service.implement;

import com.canchapp.CanchAPP_Back.dto.EstablecimientoDTO;
import com.canchapp.CanchAPP_Back.model.Establecimiento;
import com.canchapp.CanchAPP_Back.model.Perfil;
import com.canchapp.CanchAPP_Back.model.Usuario;
import com.canchapp.CanchAPP_Back.repository.EstablecimientoRepository;
import com.canchapp.CanchAPP_Back.repository.PerfilRepository;
import com.canchapp.CanchAPP_Back.repository.UsuarioRepository;
import com.canchapp.CanchAPP_Back.service.interfaces.EstablecimientoService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EstablecimientoServiceImpl implements EstablecimientoService {

  private final EstablecimientoRepository establecimientoRepository;
  private final UsuarioRepository usuarioRepository;
  private final PerfilRepository perfilRepository;
  private final PasswordEncoder passwordEncoder;
  private final ModelMapper modelMapper;
  private final com.canchapp.CanchAPP_Back.service.StorageService storageService;

  @Override
  public List<EstablecimientoDTO> obtenerTodos() {
    List<EstablecimientoDTO> establecimientos = establecimientoRepository.findAll()
      .stream()
      .map(establecimiento -> modelMapper.map(establecimiento, EstablecimientoDTO.class))
      .collect(Collectors.toList());
    return establecimientos;
  }

  @Override
  public EstablecimientoDTO obtenerPorId(Integer id) {
    return establecimientoRepository.findById(id)
      .map(establecimiento -> modelMapper.map(establecimiento, EstablecimientoDTO.class))
      .orElseThrow(() -> new RuntimeException("Establecimiento con ID " + id + " no encontrado"));
  }

  @Override
  @Transactional
  public EstablecimientoDTO crearEstablecimiento(EstablecimientoDTO establecimientoDTO) {
    try {
      // Validar que venga el usuario
      if (establecimientoDTO.getUsuario() == null) {
        throw new RuntimeException("La información del dueño (usuario) es obligatoria");
      }

      Usuario usuarioDueno = new Usuario();
      modelMapper.map(establecimientoDTO.getUsuario(), usuarioDueno);

      // Ignoramos lo que envíe el FrontEnd por seguridad y asignamos el rol correcto
      String codigoPerfil = "PROPIETARIO";

      Perfil perfil = perfilRepository.findByCodigo(codigoPerfil)
        .orElseThrow(() -> new RuntimeException("Perfil de Propietario no encontrado en la base de datos"));

      usuarioDueno.setPerfil(perfil);

      // Encriptar contraseña
      usuarioDueno.setContrasena(passwordEncoder.encode(establecimientoDTO.getUsuario().getContrasena()));

      usuarioDueno.setEstado(true);
      usuarioDueno.setFechaCreacion(LocalDateTime.now());

      if (usuarioDueno.getUsuarioCreacion() == null) {
        usuarioDueno.setUsuarioCreacion("SISTEMA_REGISTRO");
      }

      Usuario duenoGuardado = usuarioRepository.save(usuarioDueno);

      // Crear establecimiento
      Establecimiento establecimiento = new Establecimiento();
      modelMapper.map(establecimientoDTO, establecimiento);

      // Si mandaron la imagen vacía ("") o con puros espacios ("   "), la forzamos a null
      if (establecimiento.getImagenUrl() != null && establecimiento.getImagenUrl().trim().isEmpty()) {
        establecimiento.setImagenUrl(null);
      }

      establecimiento.setUsuario(duenoGuardado);
      establecimiento.setEstado(true);
      establecimiento.setFechaCreacion(LocalDateTime.now());
      establecimiento.setUsuarioCreacion(duenoGuardado.getCorreo());

      Establecimiento establecimientoGuardado = establecimientoRepository.save(establecimiento);

      System.out.println("Establecimiento y Dueño creados exitosamente con rol PROPIETARIO");
      return modelMapper.map(establecimientoGuardado, EstablecimientoDTO.class);

    } catch (Exception e) {
      System.out.println("Error al crear el negocio: " + e.getMessage());
      throw new RuntimeException("Error creando el establecimiento y su dueño: " + e.getMessage());
    }
  }

  @Override
  public EstablecimientoDTO actualizarEstablecimiento(Integer id, EstablecimientoDTO establecimientoDTO) {
    try {
      Establecimiento establecimientoExistente = establecimientoRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Establecimiento no encontrado con el ID: " + id));

      // Actualizaciones de datos básicos
      if (establecimientoDTO.getNombreEstablecimiento() != null) {
        establecimientoExistente.setNombreEstablecimiento(establecimientoDTO.getNombreEstablecimiento());
      }
      if (establecimientoDTO.getDireccion() != null) {
        establecimientoExistente.setDireccion(establecimientoDTO.getDireccion());
      }
      if (establecimientoDTO.getNumeroTelefono() != null) {
        establecimientoExistente.setNumeroTelefono(establecimientoDTO.getNumeroTelefono());
      }

      // Si llega null, significa que el front no mandó el campo (no hacemos nada, se queda la foto que estaba).
      if (establecimientoDTO.getImagenUrl() != null) {

        String urlNueva = establecimientoDTO.getImagenUrl().trim(); // Quitamos espacios tramposos
        String urlVieja = establecimientoExistente.getImagenUrl();

        if (urlNueva.isEmpty()) {
          // ESCENARIO: El front mandó "" explícitamente para BORRAR la foto.
          if (urlVieja != null) {
            String nombreArchivoViejo = urlVieja.substring(urlVieja.lastIndexOf("/") + 1);
            storageService.eliminarImagen(nombreArchivoViejo); // Borramos el archivo físico
          }
          establecimientoExistente.setImagenUrl(null); // Guardamos null en la Base de Datos

        } else {
          // ESCENARIO: El front mandó una URL con texto
          if (!urlNueva.equals(urlVieja)) {
            // Solo si la URL es NUEVA y diferente a la que ya teníamos
            if (urlVieja != null) {
              String nombreArchivoViejo = urlVieja.substring(urlVieja.lastIndexOf("/") + 1);
              storageService.eliminarImagen(nombreArchivoViejo); // Destruimos la vieja
            }
            establecimientoExistente.setImagenUrl(urlNueva); // Guardamos la nueva
          }
          // Si urlNueva es IGUAL a urlVieja, el código no hace nada y la imagen se mantiene intacta.
        }
      }

      // Auditoría
      String usuarioModificador = SecurityContextHolder.getContext().getAuthentication().getName();
      establecimientoExistente.setUsuarioModificacion(usuarioModificador);
      establecimientoExistente.setFechaModificacion(LocalDateTime.now());

      // Guardar en base de datos
      Establecimiento establecimientoActualizado = establecimientoRepository.save(establecimientoExistente);

      return modelMapper.map(establecimientoActualizado, EstablecimientoDTO.class);

    } catch (Exception e) {
      System.out.println("Error al actualizar el establecimiento: " + e.getMessage());
      throw new RuntimeException("Error al actualizar: " + e.getMessage());
    }
  }

  @Override
  public Void eliminarEstablecimiento(Integer id) {
    try {
      Establecimiento establecimiento = establecimientoRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Establecimiento no encontrado con el ID: " + id));

      //Solo cambiamos el estado a falso (inactivo)
      establecimiento.setEstado(false);
      // registramos quién lo eliminó
      String usuarioModificador = SecurityContextHolder.getContext().getAuthentication().getName();
      establecimiento.setUsuarioModificacion(usuarioModificador);
      establecimiento.setFechaModificacion(LocalDateTime.now());
      //guardamos los cambios
      establecimientoRepository.save(establecimiento);

        /* NOTA:
           Si por alguna razón  exige un BORRADO FÍSICO
           (borrar el dato permanentemente de la tabla), borrar las líneas
           anteriores y solo usarías esta:
           establecimientoRepository.delete(establecimiento);
        */

      return null; // Retornamos null porque la firma del método exige 'Void'

    } catch (Exception e) {
      System.out.println("Error al eliminar el establecimiento: " + e.getMessage());
      throw new RuntimeException("Error al eliminar: " + e.getMessage());
    }
  }

  @Override
  public Void activarEstablecimiento(Integer id) {
    try {
      Establecimiento establecimiento = establecimientoRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Establecimiento no encontrado con el ID: " + id));

      establecimiento.setEstado(true);
      String usuarioModificador = SecurityContextHolder.getContext().getAuthentication().getName();
      establecimiento.setUsuarioModificacion(usuarioModificador);
      establecimientoRepository.save(establecimiento);

      return null;

    } catch (Exception e) {
      System.out.println("Error al activar el establecimiento: " + e.getMessage());
      throw new RuntimeException("Error al activar: " + e.getMessage());
    }
  }

  @Override
  @Transactional(readOnly = true)
  public String obtenerImagenUrl(Integer establecimientoId) {
    Establecimiento est = establecimientoRepository.findById(establecimientoId)
      .orElseThrow(() -> new RuntimeException("Establecimiento no encontrado"));

    return est.getImagenUrl();
  }
}
