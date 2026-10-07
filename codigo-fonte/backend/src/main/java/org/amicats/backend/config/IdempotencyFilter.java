package org.amicats.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Set;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.amicats.backend.repository.idempotency.IdempotencyStore;
import org.amicats.backend.repository.idempotency.IdempotencyStore.StoredResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingResponseWrapper;

@Component
@RequiredArgsConstructor
public class IdempotencyFilter extends OncePerRequestFilter {

  public static final String HEADER = "Idempotency-Key";
  public static final String REPLAY_HEADER = "Idempotent-Replayed";

  private static final Set<String> MUTATING_METHODS = Set.of("POST", "PUT", "PATCH", "DELETE");
  private static final Pattern VALID_KEY = Pattern.compile("^[A-Za-z0-9_-]{8,100}$");

  private final IdempotencyStore idempotencyStore;

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {

    String key = request.getHeader(HEADER);
    Integer userId = authenticatedUserId();

    if (key == null || userId == null || !MUTATING_METHODS.contains(request.getMethod())) {
      filterChain.doFilter(request, response);
      return;
    }

    if (!VALID_KEY.matcher(key).matches()) {
      writeError(response, HttpStatus.BAD_REQUEST, "Idempotency-Key inválida.");
      return;
    }

    String method = request.getMethod();
    String path = request.getRequestURI();

    if (!idempotencyStore.claim(userId, key, method, path)) {
      replayOrReject(userId, key, method, path, response);
      return;
    }

    ContentCachingResponseWrapper wrapper = new ContentCachingResponseWrapper(response);

    try {
      filterChain.doFilter(request, wrapper);
    } catch (IOException | ServletException | RuntimeException e) {
      idempotencyStore.release(userId, key);
      throw e;
    }

    int status = wrapper.getStatus();

    if (status >= 200 && status < 300) {
      idempotencyStore.complete(
          userId,
          key,
          status,
          wrapper.getContentType(),
          new String(wrapper.getContentAsByteArray(), StandardCharsets.UTF_8));
    } else {
      idempotencyStore.release(userId, key);
    }

    wrapper.copyBodyToResponse();
  }

  private void replayOrReject(
      Integer userId, String key, String method, String path, HttpServletResponse response)
      throws IOException {

    StoredResponse stored = idempotencyStore.find(userId, key).orElse(null);

    if (stored == null) {
      writeError(response, HttpStatus.TOO_EARLY, "Requisição em andamento. Tente novamente.");
      return;
    }

    if (!stored.method().equals(method) || !stored.path().equals(path)) {
      writeError(
          response,
          HttpStatus.UNPROCESSABLE_ENTITY,
          "Idempotency-Key já utilizada em outra requisição.");
      return;
    }

    if (stored.isProcessing()) {
      writeError(response, HttpStatus.TOO_EARLY, "Requisição em andamento. Tente novamente.");
      return;
    }

    response.setStatus(stored.status());
    response.setHeader(REPLAY_HEADER, "true");

    if (stored.contentType() != null) {
      response.setContentType(stored.contentType());
    }

    if (stored.body() != null && !stored.body().isEmpty()) {
      response.setCharacterEncoding(StandardCharsets.UTF_8.name());
      response.getWriter().write(stored.body());
    }
  }

  private Integer authenticatedUserId() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null || !authentication.isAuthenticated()) {
      return null;
    }

    try {
      return Integer.valueOf(authentication.getName());
    } catch (NumberFormatException e) {
      return null;
    }
  }

  private void writeError(HttpServletResponse response, HttpStatus status, String message)
      throws IOException {
    response.setStatus(status.value());
    response.setContentType("application/json");
    response.setCharacterEncoding(StandardCharsets.UTF_8.name());
    response.getWriter().write("{\"error\":\"" + message + "\"}");
  }
}
