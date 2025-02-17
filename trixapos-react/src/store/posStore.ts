import { create } from 'zustand';
import { CartItem, Customer } from '../types/pos';

interface POSStore {
  cart: CartItem[];
  customer: Customer | null;
  total: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemCode: string) => void;
  updateQuantity: (itemCode: string, qty: number) => void;
  setCustomer: (customer: Customer | null) => void;
  clearCart: () => void;
}

export const usePOSStore = create<POSStore>((set, get) => ({
  cart: [],
  customer: null,
  total: 0, // ✅ Now part of Zustand state (reactive)

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
        total: updatedCart.reduce((sum, i) => sum + (i.rate * i.qty - (i.discount || 0)), 0),
      };
    });
  },

  removeFromCart: (itemCode) => {
    set((state) => {
      const updatedCart = state.cart.filter((i) => i.item_code !== itemCode);
      return {
        cart: updatedCart,
        total: updatedCart.reduce((sum, i) => sum + (i.rate * i.qty - (i.discount || 0)), 0),
      };
    });
  },

  updateQuantity: (itemCode, qty) => {
    set((state) => {
      const updatedCart = state.cart.map((i) =>
        i.item_code === itemCode ? { ...i, qty: Math.max(1, qty) } : i
      );

      return {
        cart: updatedCart,
        total: updatedCart.reduce((sum, i) => sum + (i.rate * i.qty - (i.discount || 0)), 0),
      };
    });
  },

  setCustomer: (customer) => set({ customer }),

  clearCart: () => set({ cart: [], customer: null, total: 0 }), // ✅ Reset total when clearing cart
}));
