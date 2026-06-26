import { ProductType } from './../../../../types/product.type';
import { Component, signal, OnInit, Input, effect, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Environments } from '../../../environments/environments';
import { NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceCart } from '../../services/service.cart';
import { TypeCart } from '../../../../types/cart.type';

import { FavoriteType } from '../../../../types/favorite.type';
import { DefaultResponseType } from '../../../../types/default.response.type';
import { FavoriteService } from '../../services/favorite.service';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, NgStyle, FormsModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard implements OnInit {
  @Input() product!: ProductType;
  @Input() countInCart: number = 0;
  @Input() isEasy: boolean = false;
  urlImg = Environments.urlImg;
  quantity: number = 1;
  isLoading = signal(false);
  isInCart = signal(false);
  // @Input() isInFavorite: boolean = true;

  constructor(private cartService: ServiceCart) {}
  ngOnInit(): void {
    if (this.countInCart > 0) {
      this.isLoading.set(true);
      this.quantity = this.countInCart;
    }
  }

  addToCart() {
    this.cartService.updateCart(this.product.id ?? 0, this.quantity).subscribe((data: TypeCart) => {
      this.isLoading.set(true);
      this.countInCart = this.quantity;

      console.log(this.isLoading());
      console.log(this.countInCart);
    });
  }
  updateCart(value: number) {
    this.quantity = value;
    this.cartService.updateCart(this.product.id ?? 0, this.quantity).subscribe((data: TypeCart) => {
      this.isLoading.set(true);
      this.countInCart = this.quantity;

      console.log(data);
      console.log(this.countInCart);
    });
  }
  addFavorites() {
    this.cartService
      .addFavorites(this.product.id ?? 0)
      .subscribe((data: FavoriteType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          const error = (data as DefaultResponseType).message;
          throw new Error(error);
        }

        this.product = { ...this.product, isInFavorite: true };
        this.isLoading.set(false);

        console.log(this.product.isInFavorite);
        console.log(data);
      });
  }
  // Обработка ручного ввода
  onQuantityInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value, 10);
    if (isNaN(value)) value = 1;
    this.quantity = Math.max(1, Math.min(999, value));
    if (this.isLoading()) {
      this.cartService
        .updateCart(this.product.id ?? 0, this.quantity)
        .subscribe((data: TypeCart) => {
          this.isLoading.set(true);
          // this.countInCart = this.quantity;

          console.log(data);
          console.log(this.countInCart);
        });
    }
  }
  // Увеличение количества
  increaseQuantity(): void {
    if (this.quantity < 999) {
      this.quantity++;
      if (this.isLoading()) {
        this.cartService
          .updateCart(this.product.id ?? 0, this.quantity)
          .subscribe((data: TypeCart) => {
            this.isLoading.set(true);

            console.log(data);
            console.log(this.countInCart);
          });
      }
    }
  }

  // Уменьшение количества
  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
      if (this.isLoading()) {
        this.cartService
          .updateCart(this.product.id ?? 0, this.quantity)
          .subscribe((data: TypeCart) => {
            this.isLoading.set(true);

            console.log(data);
            console.log(this.countInCart);
          });
      }
    }
  }

  removeFromCart() {
    this.cartService.updateCart(this.product.id ?? 0, 0).subscribe((data: TypeCart) => {
      this.isLoading.set(false);
      this.quantity = 1;
      // this.countInCart = 0;

      console.log(data);
      console.log(this.countInCart);
    });
  }

  // ngOnDestroy(): void {
  //   this.destroy$.next();
  //   this.destroy$.complete();
  // }

  // // Проверка наличия товара в корзине
  // private checkIfInCart(): void {
  //   const items = this.cartService.cartItems();
  //   const found = items.find((item) => item.product.id === this.product?.id);
  //   this.isInCart.set(!!found);
  //   if (found) {
  //     this.countInCart = found.quantity;
  //   }
  // }

  // // Увеличение количества
  // increaseQuantity(): void {
  //   if (this.quantity < 999) {
  //     this.quantity++;
  //   }
  // }

  // // Уменьшение количества
  // decreaseQuantity(): void {
  //   if (this.quantity > 1) {
  //     this.quantity--;
  //   }
  // }

  // // Обработка ручного ввода
  // onQuantityInput(event: Event): void {
  //   const input = event.target as HTMLInputElement;
  //   let value = parseInt(input.value, 10);
  //   if (isNaN(value)) value = 1;
  //   this.quantity = Math.max(1, Math.min(999, value));
  // }

  // // ✅ Универсальный метод обновления корзины
  // private updateCart(quantity: number): void {
  //   if (this.isLoading()) return;

  //   this.isLoading.set(true);

  //   this.cartService
  //     .updateQuantity(this.product.id, quantity)
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe({
  //       next: (response) => {
  //         console.log(`✅ Товар "${this.product.name}" обновлен, кол-во: ${quantity}`);

  //         if (quantity > 0) {
  //           this.isInCart.set(true);
  //           this.countInCart = quantity;
  //         } else {
  //           this.isInCart.set(false);
  //           this.countInCart = 0;
  //         }

  //         this.isLoading.set(false);
  //       },
  //       error: (err) => {
  //         console.error('❌ Ошибка:', err);
  //         this.isLoading.set(false);
  //       },
  //     });
  // }

  // // Добавление в корзину
  // addToCart(): void {
  //   if (this.isInCart()) {
  //     // Если уже в корзине, обновляем количество
  //     this.updateCart(this.quantity);
  //   } else {
  //     // Если нет, добавляем
  //     this.isLoading.set(true);

  //     this.cartService
  //       .addToCart(this.product.id, this.quantity)
  //       .pipe(takeUntil(this.destroy$))
  //       .subscribe({
  //         next: () => {
  //           console.log(`✅ Товар "${this.product.name}" добавлен в корзину`);
  //           this.isInCart.set(true);
  //           this.countInCart = this.quantity;
  //           this.isLoading.set(false);
  //           this.quantity = 1; // Сбрасываем количество
  //         },
  //         error: (err) => {
  //           console.error('❌ Ошибка:', err);
  //           this.isLoading.set(false);
  //         },
  //       });
  //   }
  // }

  // // Обновление количества (если товар уже в корзине)
  // updateCount(value: number): void {
  //   this.quantity = value;
  //   if (this.isInCart()) {
  //     this.updateCart(this.quantity);
  //   }
  // }

  // // Удаление из корзины
  // removeFromCart(): void {
  //   if (confirm('Удалить товар из корзины?')) {
  //     this.updateCart(0);
  //   }
  // }

  // // Переход на страницу товара
  // navigateToProduct(): void {
  //   this.router.navigate(['/product', this.product.id]);
  // }

  // isInCart = computed(() => {
  //   const items = this.cartService.cartItems();
  //   return items.some((item) => item.product.id === this.product?.id);
  // });

  // ngOnInit(): void {
  //   if (this.countInCart > 1) {
  //     this.count = this.countInCart;
  //   }
  //   console.log(this.count);
  //   console.log(this.countInCart);
  // }

  // increaseQuantity(): void {
  //   if (this.count < 999) {
  //     this.count++;
  //   }
  // }

  // // Уменьшение количества
  // decreaseQuantity(): void {
  //   if (this.count > 1) {
  //     this.count--;
  //   }
  // }
  // onQuantityInput(event: Event): void {
  //   const input = event.target as HTMLInputElement;
  //   let value = parseInt(input.value, 10);

  //   if (isNaN(value)) {
  //     value = 1;
  //   }

  //   // Ограничиваем значение
  //   value = Math.max(1, Math.min(999, value));
  //   this.count = value;
  // }
  // addToProduct() {
  //   if (!this.product?.id || this.isLoading()) return;
  //   this.isLoading.set(true);
  //   this.cartService.addToCart(this.product.id, this.count).subscribe((data: TypeCart) => {
  //     this.countInCart = this.count;
  //     console.log(data);
  //   });
  // }
}
