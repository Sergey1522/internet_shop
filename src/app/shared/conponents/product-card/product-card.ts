import { ProductType } from './../../../../types/product.type';
import {
  Component,
  signal,
  OnInit,
  Input,
  effect,
  computed,
  inject,
  ChangeDetectionStrategy,
  input,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Environments } from '../../../environments/environments';
import { NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceCart } from '../../services/service.cart';
import { TypeCart } from '../../../../types/cart.type';

import { FavoriteType } from '../../../../types/favorite.type';
import { DefaultResponseType } from '../../../../types/default.response.type';
import { FavoriteService } from '../../services/favorite.service';
import { AuthService } from '../../../core/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, NgStyle, FormsModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard implements OnInit {
  favoriteService = inject(FavoriteService);
  authServices = inject(AuthService);
  private _snackbar = inject(MatSnackBar);

  public readonly product = input.required<ProductType>();
  @Input() countInCart: number = 0;
  @Input() isEasy: boolean = false;
  urlImg = Environments.urlImg;
  quantity: number = 1;
  isLoading = signal(false);
  isInCart = signal(false);
  isLogged = signal<boolean>(false);
  protected readonly _isInFavorite = signal<boolean>(false);

  constructor(private cartService: ServiceCart) {
    this.isLogged.set(this.authServices.getIsLoggedIn())
  }
  ngOnInit(): void {
    if (this.countInCart > 0) {
      this.isLoading.set(true);
      this.quantity = this.countInCart;
    }
    if (this.authServices.getIsLoggedIn()) {
      this.favoriteService
        .getFavorites()
        .subscribe((data: FavoriteType[] | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            const error = (data as DefaultResponseType).message;
            throw new Error(error);
          }

          if ((data as FavoriteType[]).find((f) => f.id === this.product().id)) {
            this._isInFavorite.set(true);
          }
        });
    }
  }


  addToCart() {
    const id = this.product().id;
    if (id == null) {
      return;
    }
    this.cartService.updateCart(id, this.quantity).subscribe((data: TypeCart) => {
      this.isLoading.set(true);
      this.countInCart = this.quantity;
    });
  }
  updateCart(value: number) {
    this.quantity = value;
    const id = this.product().id;
    if (id == null) {
      return;
    }
    this.cartService.updateCart(id, this.quantity).subscribe((data: TypeCart) => {
      this.isLoading.set(true);
      this.countInCart = this.quantity;
    });
  }
  updateToFavorites() {
    if (!this.authServices.getIsLoggedIn()) {
      this._snackbar.open('Для добавление в избранное вам необходимо авторизоваться', '', {
        duration: 3000,
      });
      return;
    }
    const id = this.product().id;
    if (id == null) {
      return;
    }
    if (this._isInFavorite()) {
      this.favoriteService.removeFavorite(id).subscribe((data: DefaultResponseType) => {
        if (data.error) {
          //...

          throw new Error(data.message);
        }
        this._isInFavorite.set(false);
      });
    } else {
      this.cartService.addFavorites(id).subscribe((data: FavoriteType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          const error = (data as DefaultResponseType).message;
          throw new Error(error);
        }

        this._isInFavorite.set(true);
        this.isLoading.set(false);
      });
    }
  }
  // Обработка ручного ввода
  onQuantityInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value, 10);
    if (isNaN(value)) value = 1;
    this.quantity = Math.max(1, Math.min(999, value));
    if (this.isLoading()) {
      const id = this.product().id;
      if (id == null) {
        return;
      }
      this.cartService.updateCart(id, this.quantity).subscribe((data: TypeCart) => {
        this.isLoading.set(true);
      });
    }
  }
  // Увеличение количества
  increaseQuantity(): void {
    if (this.quantity < 999) {
      this.quantity++;
      if (this.isLoading()) {
        const id = this.product().id;
        if (id == null) {
          return;
        }
        this.cartService.updateCart(id, this.quantity).subscribe((data: TypeCart) => {
          this.isLoading.set(true);
        });
      }
    }
  }

  // Уменьшение количества
  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
      if (this.isLoading()) {
        const id = this.product().id;
        if (id == null) {
          return;
        }
        this.cartService.updateCart(id, this.quantity).subscribe((data: TypeCart) => {
          this.isLoading.set(true);
        });
      }
    }
  }

  removeFromCart() {
    const id = this.product().id;
    if (id == null) {
      return;
    }
    this.cartService.updateCart(id, 0).subscribe((data: TypeCart) => {
      this.isLoading.set(false);
      this.quantity = 1;
    });
  }
}
