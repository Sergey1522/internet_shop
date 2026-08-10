import { Injectable, signal } from '@angular/core';
import { TypeCart } from '../../../types/cart.type';
import { BehaviorSubject, catchError, Observable, Subject, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Environments } from '../../environments/environments';
import { FavoriteType } from '../../../types/favorite.type';

@Injectable({
  providedIn: 'root',
})
export class ServiceCart {
  private apiUrl = Environments.api + 'cart';
  private apiUrlFav = Environments.api + 'favorites';
  private apiUrlCount = Environments.api + 'cart/count';
  cartItems = signal<TypeCart[]>([]);
  cartCount: number = 0;
  count$: Subject<number> = new Subject<number>();

  constructor(private http: HttpClient) {}

  getCart(): Observable<TypeCart> {
    return this.http.get<TypeCart>(this.apiUrl, { withCredentials: true });
  }
  getCartCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(this.apiUrlCount, { withCredentials: true }).pipe(
      tap((data) => {
        this.cartCount = data.count;
        this.count$.next(this.cartCount);
      }),
    );
  }

  updateCart(productId: string, quantity: number): Observable<TypeCart> {
    return this.http
      .post<TypeCart>(this.apiUrl, { productId, quantity }, { withCredentials: true })
      .pipe(
        tap((data) => {
          this.cartCount = 0;
          data.items.forEach((item) => {
            this.cartCount += item.quantity;

            console.log(item.quantity);
          });
          this.count$.next(this.cartCount);
        }),
      );
  }
  addFavorites(productId: string): Observable<FavoriteType> {
    return this.http.post<FavoriteType>(this.apiUrlFav, { productId }, { withCredentials: true });
  }
}
