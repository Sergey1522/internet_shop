import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { TypeCart } from '../../../../types/cart.type';
import { ServiceCart } from '../../../shared/services/service.cart';
import { CommonModule } from '@angular/common';
import { Environments } from '../../../environments/environments';
import { Router, RouterLink } from '@angular/router';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { ProductType } from '../../../../types/product.type';
import { ProductService } from '../../../shared/services/product.service';
import { ProductCard } from '../../../shared/conponents/product-card/product-card';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CarouselModule, ProductCard, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  private cartService = inject(ServiceCart);
  private productService = inject(ProductService);
  private router = inject(Router);
  urlImg = Environments.urlImg;

  productCart = signal<TypeCart | null>(null);
  totalPrice = signal<number>(0);
  totalCount = signal<number>(0);
  @Input() countInCart: number = 0;
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  productExtra = signal<ProductType[]>([]);

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 2,
      },
      740: {
        items: 3,
      },
      940: {
        items: 4,
      },
    },
    nav: false,
  };

  ngOnInit(): void {
    this.productService.getBestProduct().subscribe((product: ProductType[]) => {
      console.log(product);
      this.productExtra.set(product);
    });
    this.cartService.getCart().subscribe((data: TypeCart) => {
      console.log(data);
      this.productCart.set(data);
      this.calculateTotal();
    });
  }

  calculateTotal() {
    this.totalCount.set(0);
    this.totalPrice.set(0);
    if (this.productCart()) {
      this.productCart()?.items.forEach((item) => {
        this.totalPrice.set(this.totalPrice() + item.quantity * item.product.price);
        this.totalCount.set(this.totalCount() + item.quantity);
      });
    }
  }
  // Увеличение количества
  increaseQuantity(count: number, id: number): void {
    if (count < 999) {
      count++;
      this.cartService.updateCart(id, count).subscribe((data: TypeCart) => {
        console.log(data);
        this.countInCart = count;
        this.productCart.set(data);
        this.calculateTotal();
      });
    }
  }

  // Уменьшение количества
  decreaseQuantity(count: number, id: number): void {
    if (count > 1) {
      count--;
      this.cartService.updateCart(id, count).subscribe((data: TypeCart) => {
        console.log(data);
        this.countInCart = count;
        this.productCart.set(data);
        this.calculateTotal();
      });
    }
  }
  removeFromCart(id: number, count: number) {
    this.cartService.updateCart(id ?? 0, (count = 0)).subscribe((data: TypeCart) => {
      console.log(data);
      // this.countInCart = count;
      this.productCart.set(data);
      this.calculateTotal();
    });
  }
  // ngOnDestroy(): void {
  //   this.destroy$.next();
  //   this.destroy$.complete();
  // }

  // // ✅ Загрузка корзины
  // loadCart(): void {
  //   this.loading.set(true);
  //   this.error.set(null);

  //   this.cartService
  //     .getCart()
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe({
  //       next: () => {
  //         this.loading.set(false);
  //       },
  //       error: (err) => {
  //         console.error('❌ Ошибка загрузки:', err);
  //         this.error.set('Не удалось загрузить корзину');
  //         this.loading.set(false);
  //       },
  //     });
  // }

  // // ✅ Универсальный метод обновления количества
  // private updateQuantity(productId: string, quantity: number): void {
  //   if (this.isLoading()) return;

  //   this.isLoading.set(true);

  //   this.cartService
  //     .updateQuantity(productId, quantity)
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe({
  //       next: () => {
  //         console.log(`✅ Количество товара ${productId} обновлено до ${quantity}`);
  //         this.isLoading.set(false);
  //       },
  //       error: (err) => {
  //         console.error('❌ Ошибка обновления:', err);
  //         this.error.set('Не удалось обновить количество');
  //         this.isLoading.set(false);
  //       },
  //     });
  // }

  // // ✅ Увеличение количества
  // increaseQuantity(item: any): void {
  //   this.updateQuantity(item.product.id, item.quantity + 1);
  // }

  // // ✅ Уменьшение количества
  // decreaseQuantity(item: any): void {
  //   if (item.quantity > 1) {
  //     this.updateQuantity(item.product.id, item.quantity - 1);
  //   }
  // }

  // // ✅ Обработка ручного ввода количества
  // onQuantityInput(item: any, event: Event): void {
  //   const input = event.target as HTMLInputElement;
  //   let value = parseInt(input.value, 10);

  //   if (isNaN(value)) value = 1;
  //   value = Math.max(1, Math.min(999, value));

  //   if (value !== item.quantity) {
  //     this.updateQuantity(item.product.id, value);
  //   }
  // }

  // // ✅ Удаление товара из корзины
  // removeItem(productId: string): void {
  //   if (this.isLoading()) return;

  //   if (confirm('Удалить товар из корзины?')) {
  //     this.isLoading.set(true);

  //     this.cartService
  //       .removeFromCart(productId)
  //       .pipe(takeUntil(this.destroy$))
  //       .subscribe({
  //         next: () => {
  //           console.log(`✅ Товар ${productId} удален из корзины`);
  //           this.isLoading.set(false);
  //         },
  //         error: (err) => {
  //           console.error('❌ Ошибка удаления:', err);
  //           this.error.set('Не удалось удалить товар');
  //           this.isLoading.set(false);
  //         },
  //       });
  //   }
  // }

  // // ✅ Очистка всей корзины
  // clearCart(): void {
  //   if (this.isLoading()) return;

  //   if (confirm('Очистить всю корзину?')) {
  //     this.isLoading.set(true);

  //     this.cartService
  //       .clearCart()
  //       .pipe(takeUntil(this.destroy$))
  //       .subscribe({
  //         next: () => {
  //           console.log('✅ Корзина очищена');
  //           this.isLoading.set(false);
  //         },
  //         error: (err) => {
  //           console.error('❌ Ошибка очистки:', err);
  //           this.error.set('Не удалось очистить корзину');
  //           this.isLoading.set(false);
  //         },
  //       });
  //   }
  // }

  // // ✅ Переход к оформлению заказа
  // checkout(): void {
  //   if (this.productCart().length === 0) {
  //     this.error.set('Корзина пуста');
  //     setTimeout(() => this.error.set(null), 3000);
  //     return;
  //   }
  //   this.router.navigate(['/checkout']);
  // }

  // // ✅ Переход в каталог
  // goToCatalog(): void {
  //   this.router.navigate(['/catalog']);
  // }
}
