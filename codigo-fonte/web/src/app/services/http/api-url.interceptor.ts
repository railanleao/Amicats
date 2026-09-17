import { HttpInterceptorFn } from '@angular/common/http';

import { environment } from '../../../environments/environment';

export const apiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const isAbsoluteUrl = /^https?:\/\//i.test(req.url);
  if (isAbsoluteUrl) {
    return next(req);
  }

  return next(req.clone({ url: `${environment.apiUrl}${req.url}` }));
};
