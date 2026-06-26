export type TypeCart = {
  items: {
    product: {
      id: number;
      name: string;
      url: string;
      image: string;
      price: number;
    };
    quantity: number;
  }[];
};
