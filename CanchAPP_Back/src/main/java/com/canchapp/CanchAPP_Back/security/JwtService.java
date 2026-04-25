package com.canchapp.CanchAPP_Back.security;

import com.canchapp.CanchAPP_Back.model.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

  @Value("${jwt.secret}")
  private String secretKey;

  public String generateToken(Usuario usuario) {
    Map<String, Object> extraClaims = new HashMap<>();

    if (usuario.getPerfil() != null) {
      extraClaims.put("perfil", usuario.getPerfil().getNombre());
    }
    extraClaims.put("userId", usuario.getUsuarioId());
    extraClaims.put("nombre_completo", usuario.getNombre());

    return Jwts.builder()
      .claims(extraClaims)
      .subject(usuario.getUsername())
      .issuedAt(new Date(System.currentTimeMillis()))
      .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // 24 horas
      .signWith(getKey())
      .compact();
  }

  private SecretKey getKey() {
    byte[] keyBytes = Decoders.BASE64.decode(secretKey);
    return Keys.hmacShaKeyFor(keyBytes);
  }

  public String extractUsername(String token) {
    return extractClaim(token, Claims::getSubject);
  }

  // Valida que el token pertenezca al usuario y no haya expirado
  public boolean isTokenValid(String token, UserDetails userDetails) {
    final String username = extractUsername(token);
    return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
  }

  // Verifica si la fecha actual es posterior a la fecha de expiración del token
  private boolean isTokenExpired(String token) {
    return extractExpiration(token).before(new Date());
  }

  // Extrae la fecha de expiración
  private Date extractExpiration(String token) {
    return extractClaim(token, Claims::getExpiration);
  }

  // Método genérico para extraer cualquier Claim (dato) del token
  public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
    final Claims claims = extractAllClaims(token);
    return claimsResolver.apply(claims);
  }

  // Desencripta el token usando nuestra llave secreta y obtiene todo el Payload (Cuerpo)
  private Claims extractAllClaims(String token) {
    return Jwts.parser()
      .verifyWith(getKey()) // Usamos la misma llave para verificar la firma
      .build()
      .parseSignedClaims(token)
      .getPayload(); // En JJWT 0.12.5 se usa getPayload() en lugar de getBody()
  }
}
