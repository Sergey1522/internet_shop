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
  // cartItems: any[] = [];
  @Input() countInCart: number = 0;
  cartCount = signal<number>(0);
  favoriteProducts = signal<FavoriteType[]>([]);
  quantity: number = 1;
  isLoading = signal(false);
  protected readonly inCart = signal<boolean>(false);
  urlImg = Environments.urlImg;
  cartItems = this.cartService.cartItems;

  // ✅ ДОБАВЛЕНО: Проверка, есть ли товар в корзине
  isInCart = computed(() => {
    return (productId: string) => {
      const items = this.cartItems();
      if (!items) return false;
      return items.some((item: any) => item.product?.id === productId);
    };
  });

  // ✅ ДОБАВЛЕНО: Получение количества товара в корзине
  getQuantityInCart = computed(() => {
    return (productId: string | undefined) => {
      const items = this.cartItems();
      if (!items) return 0;
      const item = items.find((item: any) => item.product?.id === productId);
      console.log(item);
      return item || 0;
    };
  });
  constructor() {}
  ngOnInit(): void {
    if (this.countInCart > 0) {
      this.isLoading.set(true);
      this.quantity = this.countInCart;
    }

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
        this.cartService.getCartCount().subscribe({
          next: (countData) => {
            this.cartCount.set(countData.count);
          },
        });
      },
      error: (err) => {
        console.error('❌ Ошибка добавления в корзину:', err);
        this.isLoading.set(false);
      },
    });
  }
}
