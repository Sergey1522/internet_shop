import { FavoriteType } from './../../../../types/favorite.type';
import { Component, computed, inject, input, Input, OnInit, signal } from '@angular/core';
import { FavoriteService } from '../../../shared/services/favorite.service';
import { DefaultResponseType } from '../../../../types/default.response.type';
import { Environments } from '../../../environments/environments';
import { CommonModule, NgStyle } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ServiceCart } from '../../../shared/services/service.cart';
import { TypeCart } from '../../../../types/cart.type';
import { ProductType } from '../../../../types/product.type';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-favorite',
  standalone: true,
  imports: [NgStyle, CommonModule],
  templateUrl: './favorite.html',
  styleUrl: './favorite.css',
})
export class Favorite implements OnInit {
  private cartService = inject(ServiceCart);
  private favoriteService = inject(FavoriteService);
  cartData = signal<TypeCart | null>(null);
  @Input() countInCart: number = 0;
  cartCount = signal<number>(0);
  favoriteProducts = signal<FavoriteType[]>([]);
  quantity: number = 1;
  isLoading = signal(false);
  protected readonly inCart = signal<boolean>(false);
  urlImg = Environments.urlImg;
  private destro$ = new Subject<void>();
  count$: Subject<number> = new Subject<number>();
  // cartItems = this.cartService.cartItems();

  isInCart = computed(() => {
    const data = this.cartData();
    return (productId: string | undefined) => {
      if (!data?.items || !productId) return false;
      return data.items.some((item: any) => item.product?.id === productId);
    };
  });

  getQuantityInCart = computed(() => {
    const data = this.cartData();
    return (productId: string | undefined) => {
      if (!data?.items || !productId) return 0;
      const item = data.items.find((item: any) => item.product?.id === productId);
      return item?.quantity || 0;
    };
  });

  constructor() {
    console.log(this.count$);
  }
  ngOnInit(): void {
    this.loadCartCount();
    this.favoriteService.getFavorites().subscribe((data: FavoriteType[] | DefaultResponseType) => {
      if ((data as DefaultResponseType).error !== undefined) {
        const error = (data as DefaultResponseType).message;
        console.log(error);
        throw new Error(error);
      }
      console.log(data);
      const favoritesWithCart = (data as FavoriteType[]).map((item) => ({
        ...item,
        quantityInCart: this.getQuantityInCart()(item.id),
      }));
      console.log(favoritesWithCart);
      this.favoriteProducts.set(favoritesWithCart);
      this.loadCartData();
    });
  }
  loadCartCount(): void {
    this.cartService
      .getCartCount()
      .pipe(takeUntil(this.destro$))
      .subscribe({
        next: (data) => {
          this.cartCount.set(data.count);
          console.log('Cart count loaded:', data.count);
        },
        error: (err) => {
          console.error('Ошибка загрузки количества:', err);
          this.cartCount.set(0);
        },
      });
    this.cartService.count$.pipe(takeUntil(this.destro$)).subscribe({
      next: (data) => {
        this.cartCount.set(data);
        console.log('Cart count loaded:', data);
      },
      error: (err) => {
        console.error('Ошибка загрузки количества:', err);
        this.cartCount.set(0);
      },
    });
  }
  loadCartData(): void {
    this.cartService.getCart().subscribe({
      next: (data: TypeCart) => {
        this.cartData.set(data);
        console.log('📦 Корзина загружена:', data);
      },
      error: (err) => {
        console.error(err);
        this.cartData.set(null);
      },
    });
  }
  removeFavorite(id: string | undefined) {
    if (!id) {
      return;
    }
    this.favoriteService.removeFavorite(id).subscribe((data: DefaultResponseType) => {
      if (data.error) {
        //...

        throw new Error(data.message);
      }
      const favoriteProducts = this.favoriteProducts();
      this.favoriteProducts.set(favoriteProducts.filter((data) => data.id !== id));
    });
  }
  ngOnDestroy(): void {
    this.destro$.next();
    this.destro$.complete();
  }
  addToCart(id: string | undefined): void {
    if (!id) {
      return;
    }

    this.isLoading.set(true);
    console.log(id);

    this.cartService.updateCart(id, this.quantity).subscribe({
      next: (data: TypeCart) => {
        this.countInCart = this.quantity;
        this.isLoading.set(false);
        console.log('✅ Товар добавлен в корзину:', this.countInCart);

        // ✅ Обновляем количество в избранном

        this.favoriteProducts.update((products) =>
          products.map((item) =>
            item.id === id ? { ...item, quantityInCart: this.getQuantityInCart()(id) } : item,
          ),
        );

        // ✅ Обновляем счетчик корзины
        // this.cartService.getCartCount().subscribe({
        //   next: (countData) => {
        //     this.cartCount.set(countData.count);
        //   },
        // });
        this.loadCartData();
      },
      error: (err) => {
        console.error('❌ Ошибка добавления в корзину:', err);
        this.isLoading.set(false);
      },
    });
  }
  destroy$(destroy$: any): import('rxjs').OperatorFunction<number, number> {
    throw new Error('Method not implemented.');
  }
}
