import { ProductType } from './../../../../types/product.type';
import { Component, signal, OnInit, Input, effect, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Environments } from '../../../environments/environments';
import { NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceCart } from '../../services/service.cart';
import { TypeCart } from '../../../../types/cart.type';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, NgStyle, FormsModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard implements OnInit {
  @Input() product!: ProductType;
  urlImg = Environments.urlImg;
  count: number = 1;
  isLoading = signal(false);
  // isInCart: boolean = false;

  constructor(private cartService: ServiceCart) {}
  // isInCart = computed(() => {
  //   return this.cartService.cartItems().some((item) => item.items === this.product?.id);
  // });

  ngOnInit(): void {
    console.log(this.count);
  }

  increaseQuantity(): void {
    if (this.count < 999) {
      this.count++;
    }
  }

  // Уменьшение количества
  decreaseQuantity(): void {
    if (this.count > 1) {
      this.count--;
    }
  }
  onQuantityInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value, 10);

    if (isNaN(value)) {
      value = 1;
    }

    // Ограничиваем значение
    value = Math.max(1, Math.min(999, value));
    this.count = value;
  }
  addToProduct() {
    if (!this.product?.id || this.isLoading()) return;
    this.isLoading.set(true);
    this.cartService.addToCart(this.product.id, this.count).subscribe((data: TypeCart) => {
      console.log(data);
    });
  }
}
