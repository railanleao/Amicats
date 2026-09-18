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
 * Rate-limits requests per IP, with a dedicated (stricter) bucket for the routes that verify a
 * secret — /auth/login and /auth/change-password, both classic brute-force targets, the second one
 * for anyone who stole a valid JWT but doesn't know the current password — and a general bucket for
 * the rest of the API. In-memory, per instance: enough for this system's scale, with no need for
 * Redis/new infra; the trade-off is that the limit isn't shared across multiple backend instances
 * running at the same time (not the case for this project today).
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
   * request.getRequestURI() is compared exactly against SENSITIVE_PATHS, but Spring/Tomcat routing
   * accepts variations that plain text wouldn't recognize as the same route — a trailing slash
   * (/auth/login/) and different casing (/AUTH/LOGIN) still reach the login controller normally, so
   * without normalizing here someone could dodge the restricted bucket just by varying the URL.
   * Confirmed manually: with the sensitive bucket's capacity already exhausted on /auth/login,
   * /auth/login/ and /AUTH/LOGIN were still getting through.
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
   * Uses only the direct connection IP (request.getRemoteAddr()), never X-Forwarded-For — the
   * backend is exposed directly today, with no reverse proxy in front (see docker-compose.yml), and
   * trusting that header without a configured trusted proxy would let any client dodge the limit by
   * just making up a different value on every request.
   */
  private String clientIp(HttpServletRequest request) {
    return request.getRemoteAddr();
  }
}
