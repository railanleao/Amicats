import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { PagedResult } from '../../models/cat.model';
import { StockItem, StockSearchParams } from '../../models/stock.model';

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

    return this.http.get<PagedResult<StockItem>>('/stock', {
      params: httpParams,
    });
  }
}
