import { create } from 'zustand';
import { CartItem, Customer } from '../../types/pos';

interface POSStore {
  cart: CartItem[];
  customer: Customer | null;
  total: number;
  orderDiscount: number; // ✅ Added total cart discount
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemCode: string) => void;
  updateQuantity: (itemCode: string, qty: number) => void;
  updateItem: (itemCode: string, qty: number, price: number, discount: number) => void;
  setCustomer: (customer: Customer | null) => void;
  setOrderDiscount: (discount: number) => void; // ✅ Function to apply order-wide discount
  clearCart: () => void;
}

export const usePOSStore = create<POSStore>((set, get) => ({
  cart: [],
  customer: null,
  total: 0,
  orderDiscount: 0, // ✅ Initialize total discount

  /**
   * Add an item to the cart.
   * If item already exists, increase its quantity.
   */
  addToCart: (item) => {
    set((state) => {
      const existingItem = state.cart.find((i) => i.item_code === item.item_code);
      let updatedCart;

      if (existingItem) {
        updatedCart = state.cart.map((i) =>
          i.item_code === item.item_code ? { ...i, qty: i.qty + 1 } : i
        );
      } else {
        updatedCart = [...state.cart, { ...item, qty: 1 }];
      }

      return {
        cart: updatedCart,
        total: updatedCart.reduce(
          (sum, i) => sum + (i.price_list_rate * i.qty - (i.discount || 0)),
          0
        ) - get().orderDiscount, // ✅ Deduct total order discount
      };
    });
  },

  /**
   * Remove an item from the cart.
   */
  removeFromCart: (itemCode) => {
    set((state) => {
      const updatedCart = state.cart.filter((i) => i.item_code !== itemCode);
      return {
        cart: updatedCart,
        total: updatedCart.reduce(
          (sum, i) => sum + (i.price_list_rate * i.qty - (i.discount || 0)),
          0
        ) - get().orderDiscount,
      };
    });
  },

  /**
   * Update the quantity of an item in the cart.
   */
  updateQuantity: (itemCode, qty) => {
    set((state) => {
      const updatedCart = state.cart.map((i) =>
        i.item_code === itemCode ? { ...i, qty: Math.max(1, qty) } : i
      );

      return {
        cart: updatedCart,
        total: updatedCart.reduce(
          (sum, i) => sum + (i.price_list_rate * i.qty - (i.discount || 0)),
          0
        ) - get().orderDiscount,
      };
    });
  },

  /**
   * Update item properties: Quantity, Price, Discount.
   */
  updateItem: (itemCode, qty, price, discount) => {
    set((state) => {
      const updatedCart = state.cart.map((i) =>
        i.item_code === itemCode
          ? { ...i, qty: Math.max(1, qty), price_list_rate: price, discount }
          : i
      );

      return {
        cart: updatedCart,
        total: updatedCart.reduce(
          (sum, i) => sum + (i.price_list_rate * i.qty - (i.discount || 0)),
          0
        ) - get().orderDiscount,
      };
    });
  },

  /**
   * Apply a discount to the entire order.
   */
  setOrderDiscount: (discount) => {
    set(() => ({ orderDiscount: discount }));

    set((state) => ({
      total: state.cart.reduce(
        (sum, i) => sum + (i.price_list_rate * i.qty - (i.discount || 0)),
        0
      ) - discount,
    }));
  },

  /**
   * Set the customer details.
   */
  setCustomer: (customer) => set({ customer }),

  /**
   * Clear the cart and reset everything.
   */
  clearCart: () => set({ cart: [], customer: null, total: 0, orderDiscount: 0 }),
}));
