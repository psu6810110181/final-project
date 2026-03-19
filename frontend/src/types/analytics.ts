// src/types/analytics.ts
export interface AnalyzedProduct {
  id: string;
  name: string;
  image: string | null;
  price: number;
  sold: number;
  avgRating: number;
  reviewCount: number;
  stock: number;
}