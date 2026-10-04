import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { PagedResult } from '../../models/cat.model';
import {
  PagedResult,
  StockItem,
  StockSearchParams,
} from '../../models/stock.model';

@Injectable({ providedIn: 'root' })
export class StockService {
  private readonly http = inject(HttpClient);

  list(params: StockSearchParams): Observable<PagedResult<StockItem>> {
    let httpParams = new HttpParams()
      .set('page', params.page)
      .set('size', params.size);

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.category) {
      httpParams = httpParams.set('category', params.category);
    }
    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }
    if (params.expirationFrom) {
      httpParams = httpParams.set('expirationFrom', params.expirationFrom);
    }
    if (params.expirationTo) {
      httpParams = httpParams.set('expirationTo', params.expirationTo);
    }

    return this.http.get<PagedResult<StockItem>>('/stock', {
      params: httpParams,
    });
  }

  findById(id: number): Observable<StockItem> {
    return this.http.get<StockItem>(`/stock/${id}`);
  }
}
