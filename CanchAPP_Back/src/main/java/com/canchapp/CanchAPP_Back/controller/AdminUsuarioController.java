package com.canchapp.CanchAPP_Back.controller;

import com.canchapp.CanchAPP_Back.dto.UsuarioDTO;
import com.canchapp.CanchAPP_Back.model.Perfil;
import com.canchapp.CanchAPP_Back.model.Usuario;
import com.canchapp.CanchAPP_Back.repository.PerfilRepository;
import com.canchapp.CanchAPP_Back.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Endpoints exclusivos del SuperAdministrador.
 * Cada método tiene @PreAuthorize("hasAuthority('SUPERADMIN')").
 * Spring verifica el rol del token ANTES de ejecutar el método.
 * Si el token no tiene el rol SUPERADMIN → 403 Forbidden automático.
 */
@RestController
@RequestMapping("/v1/api/admin/usuarios")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminUsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final PerfilRepository perfilRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;

    /**
     * HUS-004 / HUS-007: Listar todos los usuarios.
     * Parámetro opcional ?rol=JUGADOR o ?rol=PROPIETARIO para filtrar.
     * También acepta ?busqueda=nombre para filtrar por texto.
     */
    @GetMapping
    @PreAuthorize("hasAuthority('SUPERADMIN')")
    public ResponseEntity<List<UsuarioDTO>> listarUsuarios(
            @RequestParam(required = false) String rol,
            @RequestParam(required = false) String busqueda) {

        List<Usuario> usuarios = (rol != null && !rol.isBlank())
                ? usuarioRepository.findByPerfil_CodigoOrderByFechaCreacionDesc(rol.toUpperCase())
                : usuarioRepository.findAllByOrderByFechaCreacionDesc();

        // Filtro de búsqueda por texto sobre la lista ya cargada
        if (busqueda != null && !busqueda.isBlank()) {
            String termino = busqueda.toLowerCase();
            usuarios = usuarios.stream()
                    .filter(u -> (u.getNombre() != null && u.getNombre().toLowerCase().contains(termino))
                            || (u.getCorreo() != null && u.getCorreo().toLowerCase().contains(termino))
                            || (u.getNumeroTelefono() != null && u.getNumeroTelefono().contains(termino)))
                    .toList();
        }

        List<UsuarioDTO> resultado = usuarios.stream()
                .map(u -> modelMapper.map(u, UsuarioDTO.class))
                .toList();

        return ResponseEntity.ok(resultado);
    }

    /**
     * HUS-005: Crear un usuario desde el panel SuperAdmin.
     * El cuerpo debe incluir: nombre, correo, contrasena, numeroTelefono,
     * fechaNacimiento, edad, y el campo extra "perfilCodigo" (ej: "JUGADOR").
     */
    @PostMapping
    @PreAuthorize("hasAuthority('SUPERADMIN')")
    public ResponseEntity<?> crearUsuario(@RequestBody Map<String, Object> body) {
        String correo = (String) body.get("correo");

        if (usuarioRepository.existsByCorreo(correo)) {
            return ResponseEntity.badRequest().body("Este correo ya está registrado.");
        }

        String codigoPerfil = body.getOrDefault("perfilCodigo", "JUGADOR").toString();
        Perfil perfil = perfilRepository.findByCodigo(codigoPerfil.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Perfil no encontrado: " + codigoPerfil));

        Usuario nuevo = new Usuario();
        nuevo.setPerfil(perfil);
        nuevo.setCorreo(correo);
        nuevo.setContrasena(passwordEncoder.encode((String) body.get("contrasena")));
        nuevo.setNombre((String) body.get("nombre"));
        nuevo.setNumeroTelefono((String) body.get("numeroTelefono"));
        nuevo.setEdad(body.get("edad") != null ? Integer.valueOf(body.get("edad").toString()) : 0);
        nuevo.setFechaNacimiento(body.get("fechaNacimiento") != null
                ? LocalDate.parse(body.get("fechaNacimiento").toString()) : LocalDate.now());
        nuevo.setEstado(true);
        nuevo.setUsuarioCreacion("SUPERADMIN");
        nuevo.setFechaCreacion(LocalDateTime.now());

        Usuario guardado = usuarioRepository.save(nuevo);
        return ResponseEntity.ok(modelMapper.map(guardado, UsuarioDTO.class));
    }

    /**
     * HUS-006: Editar datos de cualquier usuario.
     * Campos editables: nombre, correo, numeroTelefono.
     * No permite editar historial de reservas ni contraseña desde aquí.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SUPERADMIN')")
    public ResponseEntity<?> editarUsuario(@PathVariable Integer id, @RequestBody UsuarioDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));

        if (dto.getNombre() != null && !dto.getNombre().isBlank()) {
            usuario.setNombre(dto.getNombre());
        }
        if (dto.getCorreo() != null && !dto.getCorreo().isBlank()
                && !dto.getCorreo().equals(usuario.getCorreo())) {
            if (usuarioRepository.existsByCorreoAndUsuarioIdNot(dto.getCorreo(), id)) {
                return ResponseEntity.badRequest().body("Ese correo ya está en uso por otra cuenta.");
            }
            usuario.setCorreo(dto.getCorreo());
        }
        if (dto.getNumeroTelefono() != null && !dto.getNumeroTelefono().isBlank()) {
            usuario.setNumeroTelefono(dto.getNumeroTelefono());
        }

        usuario.setUsuarioModificacion("SUPERADMIN");
        usuario.setFechaModificacion(LocalDateTime.now());

        return ResponseEntity.ok(modelMapper.map(usuarioRepository.save(usuario), UsuarioDTO.class));
    }

    /**
     * HUS-006: Cambiar estado del usuario (activar / suspender).
     * Body: { "estado": true/false, "tipoSuspension": "TEMPORAL"|"PERMANENTE", "fechaReactivacion": "YYYY-MM-DD" }
     * tipoSuspension y fechaReactivacion son opcionales (solo aplican cuando estado=false).
     */
    @PutMapping("/{id}/estado")
    @PreAuthorize("hasAuthority('SUPERADMIN')")
    public ResponseEntity<?> cambiarEstado(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));

        Boolean nuevoEstado = Boolean.valueOf(body.get("estado").toString());
        usuario.setEstado(nuevoEstado);

        if (!nuevoEstado) {
            // Si se está suspendiendo, guardamos el tipo y la fecha si aplica
            String tipo = body.get("tipoSuspension") != null ? body.get("tipoSuspension").toString() : "PERMANENTE";
            usuario.setTipoSuspension(tipo);

            if ("TEMPORAL".equals(tipo) && body.get("fechaReactivacion") != null) {
                usuario.setFechaReactivacion(LocalDate.parse(body.get("fechaReactivacion").toString()));
            } else {
                usuario.setFechaReactivacion(null);
            }
        } else {
            // Al reactivar, limpiamos los campos de suspensión
            usuario.setTipoSuspension(null);
            usuario.setFechaReactivacion(null);
        }

        usuario.setUsuarioModificacion("SUPERADMIN");
        usuario.setFechaModificacion(LocalDateTime.now());

        return ResponseEntity.ok(modelMapper.map(usuarioRepository.save(usuario), UsuarioDTO.class));
    }

    /**
     * HUS-008: Eliminar un usuario del sistema.
     * Hace un hard delete. El frontend es responsable de confirmar antes de llamar este endpoint.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('SUPERADMIN')")
    public ResponseEntity<?> eliminarUsuario(@PathVariable Integer id) {
        if (!usuarioRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        usuarioRepository.deleteById(id);
        return ResponseEntity.ok("Usuario eliminado correctamente.");
    }
}
