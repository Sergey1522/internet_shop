export type FavoriteType = {
  id: string | undefined;
  name: string;
  url: string;
  image: string;
  price: number;
  inCart?: boolean;
  countInCart?: number;
};
