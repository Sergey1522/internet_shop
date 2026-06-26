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

  cartCount: number = 0;
  count$: Subject<number> = new Subject<number>();

  constructor(private http: HttpClient) {
    // this.loadCart(); // ✅ Загружаем корзину при создании сервиса
  }

  getCart(): Observable<TypeCart> {
    return this.http.get<TypeCart>(this.apiUrl, { withCredentials: true });
  }
  getCartCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(this.apiUrlCount, { withCredentials: true }).pipe(
      tap((data) => {
        this.cartCount = data.count;
        this.count$.next(this.cartCount);
        console.log(data.count);
      }),
    );
  }

  updateCart(productId: number, quantity: number): Observable<TypeCart> {
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
  addFavorites(productId: number): Observable<FavoriteType> {
    return this.http.post<FavoriteType>(this.apiUrlFav, { productId }, { withCredentials: true });
  }

  // ✅ 1. ЗАГРУЗКА КОРЗИНЫ (обновляет сигналы)
  // loadCart(): void {
  //   this.http.get<TypeCart>(this.apiUrl).subscribe({
  //     next: (res) => {
  //       const items = res?.items || [];
  //       console.log('📦 Корзина загружена:', items);

  //       this.cartItems.set(items);
  //       this.cartTotal.set(items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0));
  //       this.cartCount.set(items.reduce((sum, i) => sum + i.quantity, 0));
  //     },
  //     error: (err) => {
  //       console.error('❌ Ошибка загрузки корзины:', err);
  //       this.clearCartState();
  //     },
  //   });
  // }

  // // ✅ 2. ПОЛУЧЕНИЕ ОБСЕРВЕЙБЛА (для компонентов, которые сами хотят подписаться)
  // getCart(): Observable<TypeCart> {
  //   return this.http.get<TypeCart>(this.apiUrl).pipe(
  //     tap((res) => this.updateCartState(res)),
  //     catchError((err) => {
  //       console.error('❌ Ошибка:', err);
  //       this.clearCartState();
  //       return throwError(() => err);
  //     }),
  //   );
  // }

  // // ✅ 3. ДОБАВЛЕНИЕ ТОВАРА
  // addToCart(productId: string, quantity: number): Observable<TypeCart> {
  //   return this.http.post<TypeCart>(`${this.apiUrl}`, { productId, quantity }).pipe(
  //     tap((res) => {
  //       console.log('✅ Товар добавлен, обновляем корзину');
  //       this.updateCartState(res);
  //     }),
  //     catchError((err) => {
  //       console.error('❌ Ошибка добавления:', err);
  //       return throwError(() => err);
  //     }),
  //   );
  // }

  // // ✅ 4. ОБНОВЛЕНИЕ КОЛИЧЕСТВА
  // updateQuantity(productId: string, quantity: number): Observable<TypeCart> {
  //   return this.http.patch<TypeCart>(`${this.apiUrl}/items/${productId}`, { quantity }).pipe(
  //     tap((res) => {
  //       console.log(`✅ Количество товара ${productId} обновлено`);
  //       this.updateCartState(res);
  //     }),
  //     catchError((err) => {
  //       console.error('❌ Ошибка обновления:', err);
  //       return throwError(() => err);
  //     }),
  //   );
  // }

  // // ✅ 5. УДАЛЕНИЕ ТОВАРА
  // removeFromCart(productId: string): Observable<TypeCart> {
  //   return this.http.delete<TypeCart>(`${this.apiUrl}/items/${productId}`).pipe(
  //     tap((res) => {
  //       console.log(`✅ Товар ${productId} удален`);
  //       this.updateCartState(res);
  //     }),
  //     catchError((err) => {
  //       console.error('❌ Ошибка удаления:', err);
  //       return throwError(() => err);
  //     }),
  //   );
  // }

  // // ✅ 6. ОЧИСТКА КОРЗИНЫ
  // clearCart(): Observable<TypeCart> {
  //   return this.http.delete<TypeCart>(this.apiUrl).pipe(
  //     tap((res) => {
  //       console.log('✅ Корзина очищена');
  //       this.updateCartState(res);
  //     }),
  //     catchError((err) => {
  //       console.error('❌ Ошибка очистки:', err);
  //       return throwError(() => err);
  //     }),
  //   );
  // }

  // // 🔧 Приватный метод: обновление состояния из ответа сервера
  // private updateCartState(cart: TypeCart): void {
  //   const items = cart?.items || [];
  //   this.cartItems.set(items);
  //   this.cartTotal.set(items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0));
  //   this.cartCount.set(items.reduce((sum, i) => sum + i.quantity, 0));
  // }

  // // 🔧 Приватный метод: сброс состояния при ошибке
  // private clearCartState(): void {
  //   this.cartItems.set([]);
  //   this.cartTotal.set(0);
  //   this.cartCount.set(0);
  // }
}
