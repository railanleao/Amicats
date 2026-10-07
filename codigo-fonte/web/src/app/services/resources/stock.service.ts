import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  CreateStockEntryRequest,
  PagedResult,
  StockItem,
  StockSearchParams,
  UpdateStockItemRequest,
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

  update(id: number, request: UpdateStockItemRequest): Observable<StockItem> {
    return this.http.put<StockItem>(`/stock/${id}`, request);
  }

  registerEntry(request: CreateStockEntryRequest): Observable<void> {
    return this.http.post<void>('/stock/entries', request);
  }
}
