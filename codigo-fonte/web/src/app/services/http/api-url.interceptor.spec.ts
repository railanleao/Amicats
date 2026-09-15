import { HttpRequest } from '@angular/common/http';
import { of } from 'rxjs';

import { environment } from '../../../environments/environment';
import { apiUrlInterceptor } from './api-url.interceptor';

describe('apiUrlInterceptor', () => {
  it('prefixes a relative URL with the configured API base URL', () => {
    const request = new HttpRequest('POST', '/auth/login', {});
    const next = jasmine.createSpy('next').and.returnValue(of());

    apiUrlInterceptor(request, next);

    expect(next).toHaveBeenCalledTimes(1);
    const forwardedRequest = next.calls.mostRecent()
      .args[0] as HttpRequest<unknown>;
    expect(forwardedRequest.url).toBe(`${environment.apiUrl}/auth/login`);
  });

  it('leaves an absolute URL untouched', () => {
    const absoluteUrl = 'https://example.com/auth/login';
    const request = new HttpRequest('POST', absoluteUrl, {});
    const next = jasmine.createSpy('next').and.returnValue(of());

    apiUrlInterceptor(request, next);

    expect(next).toHaveBeenCalledWith(request);
  });
});
