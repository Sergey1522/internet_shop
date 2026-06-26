import { Injectable } from '@angular/core';
import { Environments } from '../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FavoriteType } from '../../../types/favorite.type';
import { DefaultResponseType } from '../../../types/default.response.type';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  private apiUrl = Environments.api + 'favorites';
  constructor(private http: HttpClient) {}
  getFavorites(): Observable<FavoriteType[] | DefaultResponseType> {
    return this.http.get<FavoriteType[] | DefaultResponseType>(this.apiUrl, {
      withCredentials: true,
    });
  }
  removeFavorite(id: string): Observable<DefaultResponseType> {
    console.log(id);
    return this.http.delete<DefaultResponseType>(this.apiUrl, {
      body: { productId: id },
      withCredentials: true,
    });
  }
}
