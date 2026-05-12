import { Component, Input, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { ProductCard } from '../../shared/conponents/product-card/product-card';
import { ProductType } from '../../../types/product.type';
import { Environments } from '../../environments/environments';
import { ProductService } from '../../shared/services/product.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterLink, ProductCard, CarouselModule, CommonModule],
  templateUrl: './main.html',
  styleUrl: './main.css',
})
export class Main implements OnInit {
  products = signal<ProductType[]>([]);

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
  customOptionsReviews: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    margin: 26,
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
    },
    nav: false,
  };
  reviews = [
    {
      name: 'Ирина',
      image: './../../../assets/images/image 43.png',
      text: 'В ассортименте я встретила все комнатные растения, которые меня интересовали. Цены - лучшие в городе. Доставка - очень быстрая и с заботой о растениях. ',
    },
    {
      name: 'Анастасия',
      image: './../../../assets/images/image 42.png',
      text: 'Спасибо огромное! Цветок арека невероятно красив - просто бомба! От него все в восторге! Спасибо за сервис - все удобно сделано, доставили быстро. И милая открыточка приятным бонусом. ',
    },
    {
      name: 'Илья',
      image: './../../../assets/images/image 44.png',
      text: 'Магазин супер! Второй раз заказываю курьером, доставлено в лучшем виде. Ваш ассортимент комнатных растений впечатляет! Спасибо вам за хорошую работу! ',
    },
    {
      name: 'Анастасия',
      image: './../../../assets/images/image 42.png',
      text: 'Спасибо огромное! Цветок арека невероятно красив - просто бомба! От него все в восторге! Спасибо за сервис - все удобно сделано, доставили быстро. И милая открыточка приятным бонусом. ',
    },
  ];
  constructor(private productService: ProductService) {}
  ngOnInit(): void {
    this.productService.getBestProduct().subscribe((product: ProductType[]) => {
      this.products.set(product);
    });
  }
}
