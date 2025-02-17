export interface Item {
  name: string;
  item_name: string;
  item_code: string;
  description?: string;
  price_list_rate: number; // ✅ Renamed from "rate" to match API response
  stock_qty: number;
  image?: string;
}

export interface Customer {
  name: string;
  customer_name: string;
  email?: string;
  phone?: string;
}

export interface CartItem extends Item {
  qty: number;
  discount?: number;
}

export interface POSTransaction {
  doctype: "POS Invoice";
  customer: string;
  items: Array<{
    item_code: string;
    qty: number;
    price_list_rate: number; // ✅ Updated field name
    discount_amount?: number;
  }>;
  posting_date: string;
  posting_time: string;
  payments: Array<{
    mode_of_payment: string;
    amount: number;
  }>;
}
