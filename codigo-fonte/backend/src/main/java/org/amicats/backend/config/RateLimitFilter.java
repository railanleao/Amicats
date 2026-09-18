package org.amicats.backend.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.util.Locale;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Limita a taxa de requisições por IP, com um bucket dedicado (mais restrito) para as rotas que
 * verificam um segredo — /auth/login e /auth/change-password, ambos alvo clássico de força bruta, o
 * segundo por quem tiver roubado um JWT válido mas não souber a senha atual — e um bucket geral
 * para o resto da API. Em memória, por instância: suficiente para o porte do sistema, sem exigir
 * Redis/infra nova; o trade-off é que o limite não é compartilhado entre múltiplas instâncias do
 * backend rodando ao mesmo tempo (não é o caso deste projeto hoje).
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

  private static final Set<String> SENSITIVE_PATHS = Set.of("/auth/login", "/auth/change-password");

  @Value("${app.rate-limit.sensitive.capacity:5}")
  private int sensitiveCapacity;

  @Value("${app.rate-limit.sensitive.refill-minutes:1}")
  private int sensitiveRefillMinutes;

  @Value("${app.rate-limit.default.capacity:60}")
  private int defaultCapacity;

  @Value("${app.rate-limit.default.refill-minutes:1}")
  private int defaultRefillMinutes;

  private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {

    boolean isSensitive = SENSITIVE_PATHS.contains(normalizedPath(request));
    String key = (isSensitive ? "sensitive:" : "default:") + clientIp(request);
    Bucket bucket = buckets.computeIfAbsent(key, unused -> newBucket(isSensitive));

    if (bucket.tryConsume(1)) {
      filterChain.doFilter(request, response);
      return;
    }

    response.setStatus(429);
    response.setContentType("application/json");
    response.setHeader(
        "Retry-After",
        String.valueOf((isSensitive ? sensitiveRefillMinutes : defaultRefillMinutes) * 60));
    response.getWriter().write("{\"error\":\"Muitas requisições. Tente novamente em instantes.\"}");
  }

  /**
   * request.getRequestURI() é comparado exatamente contra SENSITIVE_PATHS, mas o roteamento do
   * Spring/Tomcat aceita variações que o texto puro não reconheceria como a mesma rota — barra
   * final (/auth/login/) e maiúsculas/minúsculas (/AUTH/LOGIN) continuam caindo no controller de
   * login normalmente, então sem normalizar aqui alguém contornava o bucket restrito só variando a
   * URL. Confirmado manualmente: com a capacidade do bucket sensitive já esgotada em /auth/login,
   * /auth/login/ e /AUTH/LOGIN ainda passavam.
   */
  private String normalizedPath(HttpServletRequest request) {
    String path = request.getRequestURI().toLowerCase(Locale.ROOT);
    if (path.length() > 1 && path.endsWith("/")) {
      path = path.substring(0, path.length() - 1);
    }
    return path;
  }

  private Bucket newBucket(boolean isSensitive) {
    int capacity = isSensitive ? sensitiveCapacity : defaultCapacity;
    int refillMinutes = isSensitive ? sensitiveRefillMinutes : defaultRefillMinutes;

    Bandwidth limit =
        Bandwidth.classic(capacity, Refill.greedy(capacity, Duration.ofMinutes(refillMinutes)));
    return Bucket.builder().addLimit(limit).build();
  }

  /**
   * Usa só o IP de conexão direta (request.getRemoteAddr()), nunca X-Forwarded-For — o backend hoje
   * é exposto direto, sem proxy reverso na frente (ver docker-compose.yml), e confiar nesse
   * cabeçalho sem um proxy confiável configurado deixaria qualquer cliente burlar o limite só
   * inventando um valor diferente a cada requisição.
   */
  private String clientIp(HttpServletRequest request) {
    return request.getRemoteAddr();
  }
}
