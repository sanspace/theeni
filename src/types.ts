// src/types.ts
export interface Item {
  id: number;
  name: string;
  quick_code: string | null;
  price: number;
  unit: string;
  is_discount_eligible: boolean;
  image_url: string | null;
}
