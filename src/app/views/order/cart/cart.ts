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
  increaseQuantity(count: number, id: string): void {
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
  decreaseQuantity(count: number, id: string): void {
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
  removeFromCart(id: string, count: number) {
    this.cartService.updateCart(id ?? 0, (count = 0)).subscribe((data: TypeCart) => {
      console.log(data);
      // this.countInCart = count;
      this.productCart.set(data);
      this.calculateTotal();
    });
  }
}
