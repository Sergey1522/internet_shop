import { Injectable, signal } from '@angular/core';
import { TypeCart } from '../../../types/cart.type';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Environments } from '../../environments/environments';

export interface CartItem {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class ServiceCart {
  private apiUrl = Environments.api + 'cart';

  private cartSubject = new BehaviorSubject<TypeCart | null>(null);
  cart$ = this.cartSubject.asObservable();

  cartItems = signal<CartItem[] | null>(null);
  cartTotal = signal<number>(0);
  cartCount = signal<number>(0);
  constructor(private http: HttpClient) {
    this.getCart();
  }

  getCart(): void {
    this.http.get<TypeCart>(this.apiUrl).subscribe({
      next: (res) => {
        this.cartItems.set(res.items || []);
        this.cartTotal.set(
          res.items?.reduce((sum, i) => sum + i.product.price * i.quantity, 0) || 0,
        );
        this.cartCount.set(res.items?.reduce((sum, i) => sum + i.quantity, 0) || 0);
      },
      error: (err) => console.error('Ошибка:', err),
    });
    // return this.http.get<TypeCart>(Environments.api + 'cart');
  }

  // postCart(productId: string, quantity: number): Observable<TypeCart> {
  //   return this.http.post<TypeCart>(Environments.api + 'cart', { productId, quantity }).pipe(
  //     tap((cart: TypeCart) => {
  //       console.log('Товар добавлен, обновляем корзину:', cart);
  //       // this.updateCartState(cart);
  //     }),
  //   );
  // }
  // ✅ Добавление товара (ПРАВИЛЬНЫЙ endpoint)
  addToCart(productId: string, quantity: number): Observable<any> {
    // ⚠️ ВАЖНО: используем ТОТ ЖЕ endpoint, что и для обновления
    // В вашем бэкенде это один и тот же метод updateCart
    return this.http
      .post(`${this.apiUrl}`, {
        productId: productId,
        quantity: quantity,
      })
      .pipe(
        tap((response: any) => {
          console.log('✅ Ответ сервера:', response);
          // Обновляем локальную корзину из ответа сервера
          if (response?.items) {
            this.cartItems.set(response.items);
          } else {
            // Если сервер не вернул items, делаем отдельный запрос
            this.getCart();
          }
        }),
      );
  }
  updateQuantity(productId: number, quantity: number): Observable<TypeCart> {
    return this.http.patch<TypeCart>(`${this.apiUrl}/items/${productId}`, { quantity }).pipe(
      tap(() => {
        console.log('✅ Запрос на сервер отправлен');
      }),
    );
  }
  removeFromCart(productId: number, cartCount: number): Observable<TypeCart> {
    return this.http.delete<TypeCart>(`${Environments.api + 'cart'}/items/${productId}`).pipe(
      tap(() => {
        console.log(`✅ Товар ${productId} удален из корзины`);
        this.getCart(); // Обновляем корзину после удаления
      }),
    );
  }
  // private updateCartState(cart: TypeCart): void {
  //   console.log(cart);
  //   this.cartSubject.next(cart);
  //   this.cartItems.set(cart?.items || []);
  //   // this.cartTotal.set(cart?.items?.reduce((sum, item) => sum + item.product.)  || 0);
  //   this.cartCount.set(cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0);
  // }
}
