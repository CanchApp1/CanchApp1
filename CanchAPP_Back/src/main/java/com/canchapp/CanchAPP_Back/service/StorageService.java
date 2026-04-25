package com.canchapp.CanchAPP_Back.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class StorageService {

  @Value("${media.storage.location}")
  private String storageLocation;

  private Path rootLocation;

  @PostConstruct
  public void init() {
    try {
      rootLocation = Paths.get(storageLocation);
      Files.createDirectories(rootLocation);
    } catch (IOException e) {
      throw new RuntimeException("No se pudo inicializar la carpeta de almacenamiento", e);
    }
  }

  public String guardarImagen(MultipartFile archivo) {
    try {
      if (archivo.isEmpty()) {
        throw new RuntimeException("El archivo está vacío");
      }

      // Generamos un nombre único: e3b0c442-foto.jpg
      String nombreOriginal = archivo.getOriginalFilename();
      String nombreUnico = UUID.randomUUID().toString() + "_" + nombreOriginal;

      Path destino = this.rootLocation.resolve(Paths.get(nombreUnico)).normalize().toAbsolutePath();

      // Copiamos el archivo a la carpeta
      try (InputStream inputStream = archivo.getInputStream()) {
        Files.copy(inputStream, destino, StandardCopyOption.REPLACE_EXISTING);
      }

      // Retornamos solo el nombre del archivo para guardarlo en la base de datos
      return nombreUnico;

    } catch (IOException e) {
      throw new RuntimeException("Fallo al guardar el archivo", e);
    }
  }

  // Añade este método en StorageService.java
  public void eliminarImagen(String nombreArchivo) {
    try {
      if (nombreArchivo != null && !nombreArchivo.isEmpty()) {
        java.nio.file.Path archivo = rootLocation.resolve(nombreArchivo).normalize().toAbsolutePath();
        java.nio.file.Files.deleteIfExists(archivo);
        System.out.println("Archivo viejo eliminado: " + nombreArchivo);
      }
    } catch (java.io.IOException e) {
      System.err.println("No se pudo eliminar el archivo viejo: " + e.getMessage());
      // No lanzamos excepción para no bloquear la actualización del usuario
    }
  }
}
