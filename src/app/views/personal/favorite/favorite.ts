import { FavoriteType } from './../../../../types/favorite.type';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FavoriteService } from '../../../shared/services/favorite.service';
import { DefaultResponseType } from '../../../../types/default.response.type';
import { Environments } from '../../../environments/environments';
import { CommonModule, NgStyle } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-favorite',
  standalone: true,
  imports: [NgStyle, CommonModule, RouterLink],
  templateUrl: './favorite.html',
  styleUrl: './favorite.css',
})
export class Favorite implements OnInit {
  private favoriteService = inject(FavoriteService);
  favoriteProducts = signal<FavoriteType[]>([]);
  urlImg = Environments.urlImg;
  constructor() {}
  ngOnInit(): void {
    this.favoriteService.getFavorites().subscribe((data: FavoriteType[] | DefaultResponseType) => {
      if ((data as DefaultResponseType).error !== undefined) {
        const error = (data as DefaultResponseType).message;
        throw new Error(error);
      }
      this.favoriteProducts.set(data as FavoriteType[]);
      console.log(data);
    });
  }
  removeFavorite(id: string) {
    this.favoriteService.removeFavorite(id).subscribe((data: DefaultResponseType) => {
      if (data.error) {
        //...

        throw new Error(data.message);
      }
      const favoriteProducts = this.favoriteProducts();
      this.favoriteProducts.set(favoriteProducts.filter((data) => data.id !== id));
    });
  }
}
