package org.amicats.backend.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class RateLimitFilterTest {

  @Mock private HttpServletRequest request;
  @Mock private FilterChain filterChain;

  private RateLimitFilter filter;

  @BeforeEach
  void setUp() {
    filter = new RateLimitFilter();
    ReflectionTestUtils.setField(filter, "sensitiveCapacity", 2);
    ReflectionTestUtils.setField(filter, "sensitiveRefillMinutes", 1);
    ReflectionTestUtils.setField(filter, "defaultCapacity", 2);
    ReflectionTestUtils.setField(filter, "defaultRefillMinutes", 1);
    lenient().when(request.getRemoteAddr()).thenReturn("127.0.0.1");
  }

  @Test
  void allowsRequestsUpToCapacityThenBlocksWithRetryAfter() throws Exception {
    when(request.getRequestURI()).thenReturn("/auth/login");

    filter.doFilter(request, new MockHttpServletResponse(), filterChain);
    filter.doFilter(request, new MockHttpServletResponse(), filterChain);

    MockHttpServletResponse blocked = new MockHttpServletResponse();
    filter.doFilter(request, blocked, filterChain);

    assertThat(blocked.getStatus()).isEqualTo(429);
    assertThat(blocked.getHeader("Retry-After")).isEqualTo("60");
    assertThat(blocked.getContentAsString()).contains("Muitas requisi");
    verify(filterChain, times(2)).doFilter(any(), any());
  }

  @Test
  void changePasswordAndLoginShareTheSameSensitiveBucket() throws Exception {
    when(request.getRequestURI()).thenReturn("/auth/login");
    filter.doFilter(request, new MockHttpServletResponse(), filterChain);
    filter.doFilter(request, new MockHttpServletResponse(), filterChain);

    when(request.getRequestURI()).thenReturn("/auth/change-password");
    MockHttpServletResponse response = new MockHttpServletResponse();
    filter.doFilter(request, response, filterChain);

    assertThat(response.getStatus()).isEqualTo(429);
  }

  @Test
  void defaultBucketIsIndependentFromTheSensitiveBucket() throws Exception {
    when(request.getRequestURI()).thenReturn("/auth/login");
    filter.doFilter(request, new MockHttpServletResponse(), filterChain);
    filter.doFilter(request, new MockHttpServletResponse(), filterChain);
    MockHttpServletResponse exhausted = new MockHttpServletResponse();
    filter.doFilter(request, exhausted, filterChain);
    assertThat(exhausted.getStatus()).isEqualTo(429);

    when(request.getRequestURI()).thenReturn("/users");
    MockHttpServletResponse stillAllowed = new MockHttpServletResponse();
    filter.doFilter(request, stillAllowed, filterChain);
    assertThat(stillAllowed.getStatus()).isEqualTo(200);
  }

  @Test
  void trailingSlashCannotBeUsedToDodgeTheSensitiveBucket() throws Exception {
    when(request.getRequestURI()).thenReturn("/auth/login");
    filter.doFilter(request, new MockHttpServletResponse(), filterChain);
    filter.doFilter(request, new MockHttpServletResponse(), filterChain);

    when(request.getRequestURI()).thenReturn("/auth/login/");
    MockHttpServletResponse response = new MockHttpServletResponse();
    filter.doFilter(request, response, filterChain);

    assertThat(response.getStatus()).isEqualTo(429);
  }

  @Test
  void differentCasingCannotBeUsedToDodgeTheSensitiveBucket() throws Exception {
    when(request.getRequestURI()).thenReturn("/auth/login");
    filter.doFilter(request, new MockHttpServletResponse(), filterChain);
    filter.doFilter(request, new MockHttpServletResponse(), filterChain);

    when(request.getRequestURI()).thenReturn("/AUTH/LOGIN");
    MockHttpServletResponse response = new MockHttpServletResponse();
    filter.doFilter(request, response, filterChain);

    assertThat(response.getStatus()).isEqualTo(429);
  }

  @Test
  void differentIpsGetIndependentBuckets() throws Exception {
    when(request.getRequestURI()).thenReturn("/auth/login");
    when(request.getRemoteAddr()).thenReturn("10.0.0.1", "10.0.0.1", "10.0.0.2");

    filter.doFilter(request, new MockHttpServletResponse(), filterChain);
    filter.doFilter(request, new MockHttpServletResponse(), filterChain);

    MockHttpServletResponse otherIp = new MockHttpServletResponse();
    filter.doFilter(request, otherIp, filterChain);

    assertThat(otherIp.getStatus()).isEqualTo(200);
  }
}
