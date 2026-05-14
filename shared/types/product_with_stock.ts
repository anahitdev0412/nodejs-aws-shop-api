import { Product } from './product';

export interface ProductWithStock extends Product {
  count: number;
}