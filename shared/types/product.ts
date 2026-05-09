export interface Product {
  id: string;
  productName: string;
  description: string;
  price: number;
  image: string;
  category: ProductCategory;
  stock: number;
  rating: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export enum ProductCategory {
  ELECTRONICS = "electronics",
  CLOTHING = "clothing",
  BOOKS = "books",
  HOME = "home",
  SPORTS = "sports",
  FOOD = "food",
}