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

export interface Customer {
  id: number;
  name: string;
  phone_number: string | null;
  email: string | null;
}

export interface CustomerReportItem {
  id: number;
  name: string;
  phone_number: string | null;
  email: string | null;
  total_orders: number;
  total_spent: number;
}

export interface OrderHistoryItem {
  id: number;
  created_at: string;
  final_total: number;
}
