import { Component, OnInit, signal } from '@angular/core';
import { ProductType } from '../../../../types/product.type';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { ProductService } from '../../../shared/services/product.service';
import { CommonModule } from '@angular/common';
import { ProductCard } from '../../../shared/conponents/product-card/product-card';
import { ActivatedRoute } from '@angular/router';
import { Environments } from '../../../environments/environments';

@Component({
  selector: 'app-ditail',
  imports: [CarouselModule, CommonModule, ProductCard],
  templateUrl: './ditail.html',
  styleUrl: './ditail.css',
})
export class Ditail implements OnInit {
  urlImg = Environments.urlImg;
  products = signal<ProductType[]>([]);
  // product!: ProductType;
  product = signal<any>(null);

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
  ) {}
  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.productService.getProduct(params['url']).subscribe((data: ProductType) => {
        this.product.set(data);
        console.log(data);
      });
    });

    this.productService.getBestProduct().subscribe((product: ProductType[]) => {
      this.products.set(product);
    });
  }
}
