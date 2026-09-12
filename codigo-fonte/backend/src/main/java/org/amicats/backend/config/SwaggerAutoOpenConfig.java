package org.amicats.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("local")
public class SwaggerAutoOpenConfig implements ApplicationListener<ApplicationReadyEvent> {
    private static final Logger log = LoggerFactory.getLogger(SwaggerAutoOpenConfig.class);

    @Value("${server.address:localhost}")
    private String serverHost;

    @Value("${server.port:8080}")
    private String serverPort;

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        String url = "http://" + serverHost + ":" + serverPort + "/swagger-ui/index.html";
        String os = System.getProperty("os.name").toLowerCase();
        try {
            if (os.contains("win")) {
                new ProcessBuilder("rundll32", "url.dll,FileProtocolHandler", url).start();
            } else if (os.contains("mac")) {
                new ProcessBuilder("open", url).start();
            } else {
                new ProcessBuilder("xdg-open", url).start();
            }
            log.info("Navegador aberto com sucesso.");
        } catch (Exception e) {
            log.warn("Falha ao abrir o navegador automaticamente: {}", e.getMessage());
        }
    }
}