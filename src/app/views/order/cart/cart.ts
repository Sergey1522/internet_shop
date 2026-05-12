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
  private cartServices = inject(ServiceCart);
  private router = inject(Router);
  urlImg = Environments.urlImg;

  productCart = this.cartServices.cartItems;
  totalPrice = this.cartServices.cartTotal;
  totalCount = this.cartServices.cartCount;

  count: number = 0;
  // productCarts = signal<TypeCart | null>(null);
  constructor() {}

  ngOnInit(): void {
    // this.cartServices.getCart();
  }

  // ✅ Увеличение количества
  increaseQuantity(item: any): void {
    this.cartServices.updateQuantity(item.product.id, item.quantity + 1).subscribe();
  }

  // ✅ Уменьшение количества
  decreaseQuantity(item: any): void {
    if (item.quantity > 1) {
      this.cartServices.updateQuantity(item.product.id, item.quantity - 1).subscribe();
    }
  }

  // ✅ Обработка ручного ввода
  onQuantityInput(item: any, event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value, 10);

    if (isNaN(value)) value = 1;
    value = Math.max(1, Math.min(999, value));

    this.cartServices.updateQuantity(item.product.id, value).subscribe();
  }

  // ✅ Удаление товара
  // removeItem(productId: string, quantity: number): void {
  //   if (confirm('Удалить товар из корзины?')) {
  //     const productIdNumber = Number(productId);
  //     this.cartServices.removeFromCart(productIdNumber, quantity).subscribe();
  //   }
  // }

  // ✅ Оформление заказа
  checkout(): void {
    if (this.productCart()?.length === 0) {
      alert('Корзина пуста');
      return;
    }
    this.router.navigate(['/checkout']);
  }
}
