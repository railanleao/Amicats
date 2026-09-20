package org.amicats.backend.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.MailException;
import org.springframework.mail.MailPreparationException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class MailService {

  private static final Logger log = LoggerFactory.getLogger(MailService.class);
  private static final String LOGO_CONTENT_ID = "amicats-logo";
  private static final String LOGO_PATH = "email-templates/logo-amicats-email.png";

  private final JavaMailSender javaMailSender;
  private final String fromAddress;

  public MailService(JavaMailSender javaMailSender, @Value("${app.mail.from}") String fromAddress) {
    this.javaMailSender = javaMailSender;
    this.fromAddress = fromAddress;
  }

  public void sendTemporaryPasswordEmail(
      String toAddress, String subject, String htmlBody, String plainTextBody)
      throws MailException {

    MimeMessage message = javaMailSender.createMimeMessage();

    try {
      // The multipart flag (true) is required here: setText(plain, html) below sets both a plain
      // and an HTML alternative body, which MimeMessageHelper only allows in multipart mode.
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
      helper.setFrom(fromAddress);
      helper.setTo(toAddress);
      helper.setSubject(subject);
      helper.setText(plainTextBody, htmlBody);
      attachLogoIfReferenced(helper, htmlBody);
    } catch (Exception e) {
      throw new MailPreparationException("Falha ao montar o e-mail de senha temporária", e);
    }

    javaMailSender.send(message);
  }

  // The inline image must be added after setText, otherwise some mail readers cannot resolve the
  // cid reference. A missing logo never blocks the email: it only loses the picture.
  private void attachLogoIfReferenced(MimeMessageHelper helper, String htmlBody) throws Exception {
    if (!htmlBody.contains("cid:" + LOGO_CONTENT_ID)) {
      return;
    }

    ClassPathResource logo = new ClassPathResource(LOGO_PATH);
    if (!logo.exists()) {
      log.warn("Logo do e-mail não encontrada em {}; o e-mail será enviado sem ela.", LOGO_PATH);
      return;
    }

    helper.addInline(LOGO_CONTENT_ID, logo, "image/png");
  }
}
