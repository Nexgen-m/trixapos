// Define an interface for an Item
export interface Item {
  item_group: string;
  name: string;
  item_name: string;
  item_code: string;
  uom?: string;           // ✅ Now optional
  warehouse?: string;
  conversion_factor?: number;
  description?: string;
  price_list_rate: number; // ✅ Renamed from "rate" for consistency
  stock_qty: number;
  image?: string;
}

export interface Customer {
  name: string;
  customer_name: string;
  territory?: string;
  customer_group?: string;
  default_price_list?: string; // ✅ Added price list field
}

// Extend Item to include quantity and discount for Cart Items
export interface CartItem extends Item {
  qty: number;
  discount?: number; // ✅ Optional discount per item
}

// Define an interface for POS Transactions (Invoice)
export interface POSTransaction {
  doctype: "POS Invoice";
  customer: string;
  items: POSItem[];
  posting_date: string;
  posting_time: string;
  payments: Payment[];
}

// Define an interface for POS Invoice Items
export interface POSItem {
  item_code: string;
  qty: number;
  price_list_rate: number;
  discount_amount?: number;
}

// Define an interface for Payments
export interface Payment {
  mode_of_payment: string;
  amount: number;
}

