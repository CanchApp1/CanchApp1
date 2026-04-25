package com.canchapp.CanchAPP_Back.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

  @Value("${media.storage.location}")
  private String storageLocation;

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    // Todo lo que entre por /media/** buscará físicamente en la carpeta uploads/
    registry.addResourceHandler("/media/**")
      .addResourceLocations("file:" + storageLocation + "/");
  }
}
