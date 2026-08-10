import { Injectable } from '@angular/core';
import { Environments } from '../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DefaultResponseType } from '../../../types/default.response.type';
import { OrderType } from '../../../types/order.type ';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = Environments.api + 'orders';
  constructor(private http: HttpClient) {}
  createOrder(params: OrderType): Observable<OrderType | DefaultResponseType> {
    return this.http.post<OrderType | DefaultResponseType>(this.apiUrl, params, {
      withCredentials: true,
    });
  }
  getOrder(): Observable<OrderType[] | DefaultResponseType> {
    return this.http.get<OrderType[] | DefaultResponseType>(this.apiUrl, {
      withCredentials: true,
    });
  }
}
