package org.amicats.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

@Component
public class SwaggerAutoOpenConfig implements ApplicationListener<ApplicationReadyEvent> {
    private static final Logger log = LoggerFactory.getLogger(SwaggerAutoOpenConfig.class);
    private static final String SWAGGER_URL = "http://localhost:8080/swagger-ui/index.html";

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        String os = System.getProperty("os.name").toLowerCase();
        try {
            if (os.contains("win")) {
                new ProcessBuilder("rundll32", "url.dll,FileProtocolHandler", SWAGGER_URL).start();
            } else if (os.contains("mac")) {
                new ProcessBuilder("open", SWAGGER_URL).start();
            } else {
                new ProcessBuilder("xdg-open", SWAGGER_URL).start();
            }
            log.info("Navegador aberto com sucesso.");
        } catch (Exception e) {
            log.warn("Falha ao abrir o navegador automaticamente: {}", e.getMessage());
        }
    }
}