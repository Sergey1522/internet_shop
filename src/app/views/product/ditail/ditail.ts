import { ServiceCart } from './../../../shared/services/service.cart';
import { Component, inject, input, Input, OnInit, signal } from '@angular/core';
import { ProductType } from '../../../../types/product.type';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { ProductService } from '../../../shared/services/product.service';
import { CommonModule } from '@angular/common';
import { ProductCard } from '../../../shared/conponents/product-card/product-card';
import { ActivatedRoute } from '@angular/router';
import { Environments } from '../../../environments/environments';
import { TypeCart } from '../../../../types/cart.type';
import { FavoriteType } from '../../../../types/favorite.type';
import { DefaultResponseType } from '../../../../types/default.response.type';
import { FavoriteService } from '../../../shared/services/favorite.service';
import { AuthService } from '../../../core/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-ditail',
  imports: [CarouselModule, CommonModule, ProductCard],
  templateUrl: './ditail.html',
  styleUrl: './ditail.css',
})
export class Ditail implements OnInit {
  private _snackbar = inject(MatSnackBar);
  private favoriteService = inject(FavoriteService);
  private authServices = inject(AuthService);
  urlImg = Environments.urlImg;
  protected readonly _isInFavorite = signal<boolean>(false);
  products = signal<ProductType[]>([]);
  quantity: number = 1;
  isLoading = signal(false);
  isInCart = signal(false);
  @Input() countInCart: number = 0;
  @Input() isInFavorite: boolean = false;

  // product!: ProductType;
  product = signal<ProductType | null>(null);
  cart = signal<TypeCart | null>(null);

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
  constructor(
    private productService: ProductService,
    private activatedRoute: ActivatedRoute,
    private cartService: ServiceCart,
  ) {}
  ngOnInit(): void {
    if (this.countInCart > 0) {
      this.isLoading.set(true);
      this.quantity = this.countInCart;
    }
    this.activatedRoute.params.subscribe((params) => {
      this.productService.getProduct(params['url']).subscribe((data: ProductType) => {
        this.cartService.getCart().subscribe((dataCart: TypeCart) => {
          const cart = dataCart;

          let countInCart = 0;

          if (cart) {
            const cartItems = cart.items || [];

            const productInCart = cartItems.find((item) => item.product.id === data.id);
            countInCart = productInCart?.quantity ?? 0;
          }

          // ✅ Создаем товар с информацией о корзине
          const productWithCart = {
            ...data,
            countInCart: countInCart,
          };
          console.log(countInCart);

          // ✅ Только один set!
          this.product.set(productWithCart);

          // Если товар в корзине, устанавливаем флаг
          if (countInCart > 0) {
            this.isLoading.set(true);

            this.quantity = countInCart;
          }

          console.log('Товар с корзиной:', productWithCart);
        });
        if (this.authServices.getIsLoggedIn()) {
          this.favoriteService
            .getFavorites()
            .subscribe((data: FavoriteType[] | DefaultResponseType) => {
              if ((data as DefaultResponseType).error !== undefined) {
                const error = (data as DefaultResponseType).message;
                throw new Error(error);
              }
              const favoriteProducts = data as FavoriteType[];
              const currentFavoriteProducts = favoriteProducts.find(
                (item) => item.id === this.product()?.id,
              );
              console.log(currentFavoriteProducts);
              if (currentFavoriteProducts) {
                const product = this.product();
                if (product) {
                  this._isInFavorite.set(true);
                }
              }
            });
        }
      });
    });

    this.productService.getBestProduct().subscribe((product: ProductType[]) => {
      this.products.set(product);
    });
  }
  addToCart() {
    const id = this.product()?.id;
    if (id == null) {
      return;
    }
    if (this.product()?.id) {
      this.cartService.updateCart(id, this.quantity).subscribe((data: TypeCart) => {
        this.isLoading.set(true);
        this.countInCart = this.quantity;
      });
    }
  }
  removeFromCart() {
    const id = this.product()?.id;
    if (id == null) {
      return;
    }
    this.cartService.updateCart(id, 0).subscribe((data: TypeCart) => {
      this.isLoading.set(false);
      this.quantity = 1;
    });
  }
  updateToFavorites() {
    if (!this.authServices.getIsLoggedIn()) {
      this._snackbar.open('Для добавление в избранное вам необходимо авторизоваться', '', {
        duration: 3000,
      });
      return;
    }
    const id = this.product()?.id;
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
  // Увеличение количества
  increaseQuantity(): void {
    if (this.quantity < 999) {
      this.quantity++;
      if (this.isLoading()) {
        const id = this.product()?.id;
        if (id == null) {
          return;
        }
        this.cartService.updateCart(id, this.quantity).subscribe((data: TypeCart) => {
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
        const id = this.product()?.id;
        if (id == null) {
          return;
        }
        this.cartService.updateCart(id, this.quantity).subscribe((data: TypeCart) => {
          this.isLoading.set(true);

          console.log(data);
          console.log(this.countInCart);
        });
      }
    }
  }
}
