import { SortType } from '../app/views/product/catalog/catalog';

export type ProductType = {
  id: string;
  name: string;
  price: number;
  image: string;
  lightning: string;
  humidity: string;
  temperature: string;
  height: number;
  diameter: number;
  sort?: SortType;
  url: string;
  type: {
    id: string;
    name: string;
    url: string;
  };
};
