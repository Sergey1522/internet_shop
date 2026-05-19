import { Component, inject, OnInit, signal } from '@angular/core';
import { TypeCart } from '../../../../types/cart.type';
import { ServiceCart } from '../../../shared/services/service.cart';
import { Observable, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Environments } from '../../../environments/environments';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  private cartService = inject(ServiceCart);
  private router = inject(Router);
  urlImg = Environments.urlImg;

  productCart = this.cartService.cartItems;
  totalPrice = this.cartService.cartTotal;
  totalCount = this.cartService.cartCount;

  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading.set(true);
    this.error.set(null);

    // ✅ Используем getCart() если нужен Observable, или просто loadCart()
    this.cartService.getCart().subscribe({
      next: () => {
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Ошибка загрузки:', err);
        this.error.set('Не удалось загрузить корзину');
        this.loading.set(false);
      },
    });
  }

  // ✅ Обновление количества
  updateQuantity(productId: string, newQuantity: number): void {
    if (newQuantity < 1) return;

    this.cartService.updateQuantity(productId, newQuantity).subscribe({
      error: (err) => console.error('Ошибка обновления:', err),
    });
  }

  // ✅ Удаление товара
  removeItem(productId: string): void {
    if (confirm('Удалить товар из корзины?')) {
      this.cartService.removeFromCart(productId).subscribe({
        error: (err) => console.error('Ошибка удаления:', err),
      });
    }
  }
}
