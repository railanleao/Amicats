package org.amicats.backend.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class WelcomeEmailTemplateTest {

  private final TemporaryPasswordEmailTemplate template = new TemporaryPasswordEmailTemplate();

  @Test
  void hasItsOwnSubject() {
    assertThat(template.welcomeSubject()).isNotBlank().isNotEqualTo(template.subject());
  }

  @Test
  void htmlBodyContainsTheNameAndThePasswordAndLeavesNoPlaceholder() {
    String html = template.welcomeHtmlBody("Rafael", "Temp0rary!Pw");

    assertThat(html).contains("Rafael").contains("Temp0rary!Pw").doesNotContain("{{");
  }

  @Test
  void htmlBodyEscapesTheNameAndThePassword() {
    String html = template.welcomeHtmlBody("Ana <b>Bia</b>", "a&copyB9");

    assertThat(html)
        .contains("Ana &lt;b&gt;Bia&lt;/b&gt;")
        .contains("a&amp;copyB9")
        .doesNotContain("<b>Bia</b>");
  }

  @Test
  void htmlBodyKeepsAccentedNamesReadable() {
    assertThat(template.welcomeHtmlBody("José", "Temp0rary!Pw")).contains("José");
  }

  @Test
  void plainTextBodyExplainsTheFirstAccess() {
    String text = template.welcomePlainTextBody("Rafael", "Temp0rary!Pw");

    assertThat(text)
        .contains("Rafael")
        .contains("Temp0rary!Pw")
        .contains("termos de uso")
        .contains("nova senha");
  }

  @Test
  void bothHtmlTemplatesReferenceTheInlineLogo() {
    assertThat(template.welcomeHtmlBody("Rafael", "Temp0rary!Pw")).contains("cid:amicats-logo");
    assertThat(template.htmlBody("Rafael", "Temp0rary!Pw")).contains("cid:amicats-logo");
  }
}
