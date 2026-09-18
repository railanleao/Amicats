package org.amicats.backend.service;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;

@Component
public class TemporaryPasswordEmailTemplate {

  private static final String TEMPLATE_PATH = "email-templates/temporary-password.html";
  private static final String SUBJECT = "Sua senha de acesso ao Amicats";

  private final String rawTemplate;

  public TemporaryPasswordEmailTemplate() {
    this.rawTemplate = loadTemplate();
  }

  public String subject() {
    return SUBJECT;
  }

  public String htmlBody(String userName, String temporaryPassword) {
    return rawTemplate
        .replace("{{userName}}", userName)
        .replace("{{temporaryPassword}}", temporaryPassword);
  }

  public String plainTextBody(String userName, String temporaryPassword) {
    return "Olá, "
        + userName
        + ".\n\n"
        + "Aqui está sua senha temporária de acesso ao sistema Amicats: "
        + temporaryPassword
        + "\n\n"
        + "Por segurança, você precisará criar uma nova senha assim que fizer login.\n\n"
        + "Se você não reconhece esta solicitação, ignore este e-mail — sua senha atual continua válida.";
  }

  private String loadTemplate() {
    try {
      return StreamUtils.copyToString(
          new ClassPathResource(TEMPLATE_PATH).getInputStream(), StandardCharsets.UTF_8);
    } catch (IOException e) {
      throw new UncheckedIOException(
          "Não foi possível carregar o template de e-mail: " + TEMPLATE_PATH, e);
    }
  }
}
