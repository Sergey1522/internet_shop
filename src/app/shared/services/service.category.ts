import { TypeType } from './../../../types/type.type';
import { CategoryWithTypeType } from './../../../types/category-with-type.type';
import { CategoryType } from './../../../types/category.type';
import { Injectable } from '@angular/core';
import { map, Observable, pipe } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Environments } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class ServiceCategory {
  constructor(private http: HttpClient) {}

  getCategory(): Observable<CategoryType[]> {
    return this.http.get<CategoryType[]>(Environments.api + 'categories');
  }
  getCategoryWithTypes(): Observable<CategoryWithTypeType[]> {
    return this.http.get<TypeType[]>(Environments.api + 'types').pipe(
      map((items: TypeType[]) => {
        const array: CategoryWithTypeType[] = [];
        items.forEach((item: TypeType) => {
          const foundItem = array.find((arrayItem) => arrayItem.url === item.category.url);

          if (foundItem) {
            foundItem.types.push({ id: item.id, name: item.name, url: item.url });
          } else {
            array.push({
              id: item.category.id,
              name: item.category.name,
              url: item.category.url,
              types: [{ id: item.id, name: item.name, url: item.url }],
            });
          }
        });
        return array;
      }),
    );
  }
}
