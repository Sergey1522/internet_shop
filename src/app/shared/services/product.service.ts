import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ProductType } from '../../../types/product.type';
import { Observable } from 'rxjs';
import { Environments } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = Environments.api + 'products';
  constructor(private http: HttpClient) {}

  getBestProduct(): Observable<ProductType[]> {
    return this.http.get<ProductType[]>(Environments.api + 'products/best');
  }
  getProducts(
    params?: any,
  ): Observable<{ totalCount: number; pages: number; items: ProductType[] }> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page !== undefined && params.page !== null) {
        httpParams = httpParams.set('page', params.page);
      }
      if (params.limit !== undefined && params.limit !== null) {
        httpParams = httpParams.set('limit', params.limit);
      }
      if (params.types && params.types.length) {
        params.types.forEach((type: string) => {
          httpParams = httpParams.append('types[]', type);
          console.log(httpParams);
        });
      }

      // Добавляем остальные параметры
      if (params.heightFrom !== undefined && params.heightFrom !== null) {
        httpParams = httpParams.set('heightFrom', params.heightFrom);
      }
      if (params.heightTo !== undefined && params.heightTo !== null) {
        httpParams = httpParams.set('heightTo', params.heightTo);
      }
      if (params.diameterFrom !== undefined && params.diameterFrom !== null) {
        httpParams = httpParams.set('diameterFrom', params.diameterFrom);
      }
      if (params.diameterTo !== undefined && params.diameterTo !== null) {
        httpParams = httpParams.set('diameterTo', params.diameterTo);
      }
    }

    // Формируем URL с параметрами
    const url = this.apiUrl + (httpParams.toString() ? `?${httpParams.toString()}` : '');
    console.log('📡 Запрос URL:', url);

    return this.http.get<{ totalCount: number; pages: number; items: ProductType[] }>(url);
  }

  getProduct(url: string): Observable<ProductType> {
    return this.http.get<ProductType>(Environments.api + 'products/' + url);
  }
}
