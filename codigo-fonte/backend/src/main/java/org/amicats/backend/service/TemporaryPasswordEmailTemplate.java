package org.amicats.backend.service;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;
import org.springframework.web.util.HtmlUtils;

@Component
public class TemporaryPasswordEmailTemplate {

  private static final String TEMPLATE_PATH = "email-templates/temporary-password.html";
  private static final String WELCOME_TEMPLATE_PATH = "email-templates/welcome.html";
  private static final String SUBJECT = "Sua senha de acesso ao Amicats";
  private static final String WELCOME_SUBJECT = "Sua conta no Amicats foi criada";

  private final String rawTemplate;
  private final String rawWelcomeTemplate;

  public TemporaryPasswordEmailTemplate() {
    this.rawTemplate = loadTemplate(TEMPLATE_PATH);
    this.rawWelcomeTemplate = loadTemplate(WELCOME_TEMPLATE_PATH);
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
        + "Se você não reconhece esta solicitação, ignore este e-mail — sua senha atual continua"
        + " válida.";
  }

  public String welcomeSubject() {
    return WELCOME_SUBJECT;
  }

  public String welcomeHtmlBody(String userName, String temporaryPassword) {
    return rawWelcomeTemplate
        .replace("{{userName}}", escapeHtml(userName))
        .replace("{{temporaryPassword}}", escapeHtml(temporaryPassword));
  }

  public String welcomePlainTextBody(String userName, String temporaryPassword) {
    return "Olá, "
        + userName
        + ".\n\n"
        + "Sua conta no sistema Amicats foi criada. Para entrar, use este e-mail e a senha "
        + "temporária abaixo:\n\n"
        + temporaryPassword
        + "\n\n"
        + "Por segurança, no primeiro acesso você precisará aceitar os termos de uso e criar uma "
        + "nova senha.\n\n"
        + "Se você não esperava este convite, ignore este e-mail.";
  }

  private static String escapeHtml(String value) {
    return HtmlUtils.htmlEscape(value, "UTF-8");
  }

  private String loadTemplate(String path) {
    try {
      return StreamUtils.copyToString(
          new ClassPathResource(path).getInputStream(), StandardCharsets.UTF_8);
    } catch (IOException e) {
      throw new UncheckedIOException("Não foi possível carregar o template de e-mail: " + path, e);
    }
  }
}
