package com.canchapp.CanchAPP_Back.service.implement;

import com.canchapp.CanchAPP_Back.service.interfaces.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

  private final JavaMailSender mailSender;

  @Override
  public void enviarCorreoRecuperacion(String destinatario, String codigo) {
    try {
      MimeMessage mensaje = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");

      helper.setTo(destinatario);
      helper.setSubject("CanchAPP - Código de recuperación de contraseña");

      // Diseño HTML básico y limpio para el correo
      String contenidoHtml = "<div style='font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;'>"
        + "<h2 style='color: #2E86C1; text-align: center;'>Recuperación de Contraseña</h2>"
        + "<p>Hola,</p>"
        + "<p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>CanchApp</strong>.</p>"
        + "<p>Tu código de verificación de 6 dígitos es:</p>"
        + "<div style='text-align: center; margin: 20px 0;'>"
        + "<span style='font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; background-color: #f4f4f4; padding: 10px 20px; border-radius: 5px;'>"
        + codigo + "</span>"
        + "</div>"
        + "<p>Este código <strong>expirará en 15 minutos</strong>.</p>"
        + "<p style='color: #777; font-size: 12px; margin-top: 30px;'>Si no solicitaste este cambio, por favor ignora este correo. Tu cuenta está segura.</p>"
        + "</div>";

      helper.setText(contenidoHtml, true); // El 'true' indica que el texto es HTML

      mailSender.send(mensaje);
      System.out.println("Correo de recuperación enviado exitosamente a: " + destinatario);

    } catch (MessagingException e) {
      System.err.println("Error al enviar el correo a " + destinatario + ": " + e.getMessage());
      throw new RuntimeException("No se pudo enviar el correo de recuperación. Intente más tarde.");
    }
  }
}
