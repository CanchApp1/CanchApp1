package com.canchapp.CanchAPP_Back.config;

import com.stripe.Stripe;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class StripeConfig {

  @Value("${stripe.api.key}")
  private String stripeApiKey;

  @PostConstruct
  public void initStripe() {
    // Esto se ejecuta automáticamente al arrancar Spring Boot
    Stripe.apiKey = stripeApiKey;
    System.out.println("Stripe inicializado correctamente en Modo de Prueba");
  }
}
