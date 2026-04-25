package com.canchapp.CanchAPP_Back.util;

import java.security.SecureRandom;

public class UtilidadSeguridad {

  // Usamos SecureRandom porque es criptográficamente seguro contra hackers
  private static final SecureRandom secureRandom = new SecureRandom();

  public static String generarCodigo6Digitos() {
    int numero = secureRandom.nextInt(999999); // Genera entre 0 y 999999
    return String.format("%06d", numero); // Rellena con ceros a la izquierda si es menor a 6 dígitos (ej: "004521")
  }
}
