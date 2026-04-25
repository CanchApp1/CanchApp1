package com.canchapp.CanchAPP_Back.service.implement;

import com.canchapp.CanchAPP_Back.dto.UsuarioDTO;
import com.canchapp.CanchAPP_Back.model.Usuario;
import com.canchapp.CanchAPP_Back.repository.UsuarioRepository;
import com.canchapp.CanchAPP_Back.service.interfaces.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

  private final UsuarioRepository usuarioRepository;
  private final PasswordEncoder passwordEncoder;
  private final ModelMapper modelMapper;

  @Override
  public UsuarioDTO actualizarMiPerfil(UsuarioDTO usuarioDTO) {

    // 1. Obtenemos el correo del usuario que está haciendo la petición desde el Token
    String correoAutenticado = SecurityContextHolder.getContext().getAuthentication().getName();

    // 2. Buscamos a ese usuario exacto en la base de datos
    Usuario miUsuario = usuarioRepository.findByCorreo(correoAutenticado)
      .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

    // 3. Actualizar Correo (Validando que no exista en otra cuenta)
    if (usuarioDTO.getCorreo() != null && !usuarioDTO.getCorreo().equals(miUsuario.getCorreo())) {
      // Verificamos si el nuevo correo ya le pertenece a otro ID
      boolean correoEnUso = usuarioRepository.existsByCorreoAndUsuarioIdNot(usuarioDTO.getCorreo(), miUsuario.getUsuarioId());
      if (correoEnUso) {
        throw new RuntimeException("El correo ingresado ya está en uso por otra cuenta.");
      }
      miUsuario.setCorreo(usuarioDTO.getCorreo());
    }

    // 4. Actualizar Contraseña (si se envía, se encripta)
    if (usuarioDTO.getContrasena() != null && !usuarioDTO.getContrasena().trim().isEmpty()) {
      miUsuario.setContrasena(passwordEncoder.encode(usuarioDTO.getContrasena()));
    }

    // 5. Actualizar Nombre
    if (usuarioDTO.getNombre() != null && !usuarioDTO.getNombre().trim().isEmpty()) {
      miUsuario.setNombre(usuarioDTO.getNombre());
    }

    // 6. Actualizar Número de Teléfono
    if (usuarioDTO.getNumeroTelefono() != null && !usuarioDTO.getNumeroTelefono().trim().isEmpty()) {
      miUsuario.setNumeroTelefono(usuarioDTO.getNumeroTelefono());
    }

    // 7. Auditoría
    miUsuario.setUsuarioModificacion(correoAutenticado);
    miUsuario.setFechaModificacion(LocalDateTime.now());

    // 8. Guardamos y retornamos
    Usuario usuarioActualizado = usuarioRepository.save(miUsuario);
    return modelMapper.map(usuarioActualizado, UsuarioDTO.class);
  }
}
