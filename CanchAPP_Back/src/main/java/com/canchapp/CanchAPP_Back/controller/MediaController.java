package com.canchapp.CanchAPP_Back.controller;

import com.canchapp.CanchAPP_Back.service.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/v1/api/media")
@CrossOrigin(origins = "*")
public class MediaController {

  @Autowired
  private StorageService storageService;

  @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public Map<String, String> subirImagen(@RequestParam("file") MultipartFile file) {
    // Guardamos el archivo y obtenemos su nuevo nombre
    String nombreArchivo = storageService.guardarImagen(file);

    // Construimos la URL pública para que el frontend la consuma
    String urlPublica = "http://localhost:8080/media/" + nombreArchivo;

    // Devolvemos la URL
    return Map.of("url", urlPublica);
  }
}
