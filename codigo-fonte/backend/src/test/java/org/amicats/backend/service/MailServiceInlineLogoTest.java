package org.amicats.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Properties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;

@ExtendWith(MockitoExtension.class)
class MailServiceInlineLogoTest {

  @Mock private JavaMailSender javaMailSender;

  private MailService mailService;

  @BeforeEach
  void setUp() {
    lenient()
        .when(javaMailSender.createMimeMessage())
        .thenReturn(new MimeMessage(Session.getInstance(new Properties())));
    mailService = new MailService(javaMailSender, "contato@ongamicats.com.br");
  }

  private String sentMessage() throws Exception {
    ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
    verify(javaMailSender).send(captor.capture());
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    captor.getValue().writeTo(out);
    return out.toString(StandardCharsets.UTF_8);
  }

  @Test
  void attachesTheLogoInlineWhenTheHtmlReferencesIt() throws Exception {
    mailService.sendTemporaryPasswordEmail(
        "rafael@amicats.org.br", "Assunto", "<img src=\"cid:amicats-logo\" />", "texto");

    assertThat(sentMessage()).contains("Content-ID: <amicats-logo>").contains("image/png");
  }

  @Test
  void doesNotAttachAnythingWhenTheHtmlDoesNotReferenceTheLogo() throws Exception {
    mailService.sendTemporaryPasswordEmail(
        "rafael@amicats.org.br", "Assunto", "<p>sem imagem</p>", "texto");

    assertThat(sentMessage()).doesNotContain("Content-ID");
  }

  @Test
  void theLogoFileExistsWhereTheServiceLooksForIt() {
    assertThat(new ClassPathResource("email-templates/logo-amicats-email.png").exists()).isTrue();
  }
}
