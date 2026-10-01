import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { apiUrlInterceptor } from './services/http/api-url.interceptor';
import { authErrorInterceptor } from './services/http/auth-error.interceptor';
import { authTokenInterceptor } from './services/http/auth-token.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        apiUrlInterceptor,
        authTokenInterceptor,
        authErrorInterceptor,
      ]),
    ),
  ],
};
