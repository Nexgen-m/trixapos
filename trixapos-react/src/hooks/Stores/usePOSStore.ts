import { create } from 'zustand';
import { CartItem, Customer } from '../../types/pos';
import { toast } from 'sonner';

interface ExtendedCartItem extends CartItem {
  discount?: number; // Percentage-based discount
}

interface POSStore {
  cart: ExtendedCartItem[];
  customer: Customer | null;
  total: number;
  orderDiscount: number;
  selectedCategory: string;
  isVerticalLayout: boolean; // New state for layout preference
  addToCart: (item: ExtendedCartItem) => void;
  removeFromCart: (itemCode: string) => void;
  updateQuantity: (itemCode: string, qty: number) => void;
  updateItem: (
    itemCode: string, 
    qty: number, 
    price: number, 
    discount?: number
  ) => void;
  setCustomer: (customer: Customer | null) => void;
  toggleLayout: () => void; // New function to toggle layouts
  setOrderDiscount: (discount: number) => void;
  setSelectedCategory: (category: string) => void;
  clearCart: () => void;
  initializeCart: () => void;
  calculateTotal: () => number;
}

export const usePOSStore = create<POSStore>((set, get) => ({
  cart: [],
  customer: null,
  total: 0,
  orderDiscount: 0,
  selectedCategory: "",
  isVerticalLayout: false, // Default to horizontal layout

  toggleLayout: () =>
    set((state) => {
      localStorage.setItem("isVerticalLayout", JSON.stringify(!state.isVerticalLayout));
      return { isVerticalLayout: !state.isVerticalLayout };
    }),

  calculateTotal: () => {
    const { cart, orderDiscount } = get();
    
    // Calculate total with percentage-based discounts
    const calculatedTotal = cart.reduce((sum, item) => {
      // Calculate full item total before discount
      const itemTotal = item.price_list_rate * item.qty;
      
      // Calculate discount amount
      const itemDiscountAmount = itemTotal * ((item.discount || 0) / 100);
      
      // Subtract discount from item total
      return sum + (itemTotal - itemDiscountAmount);
    }, 0) - orderDiscount;
    
    // Ensure total is not negative
    const finalTotal = Math.max(0, calculatedTotal);
    
    // Update store total
    set({ total: finalTotal });
    
    return finalTotal;
  },

  addToCart: (item) => {
    // Validate item price
    if (!item.price_list_rate || item.price_list_rate <= 0) {
      toast.error(`Item "${item.item_name}" must have a valid price before adding to the cart.`);
      return;
    }

    set((state) => {
      // Check if item already exists in cart
      const existingItem = state.cart.find((i) => i.item_code === item.item_code);
      
      const updatedCart = existingItem
        ? state.cart.map((i) =>
            i.item_code === item.item_code 
              ? { 
                  ...i, 
                  qty: i.qty + 1,
                  // Preserve or set discount percentage
                  discount: item.discount || i.discount || 0
                } 
              : i
          )
        : [...state.cart, { 
            ...item, 
            qty: 1, 
            // Ensure discount percentage is set
            discount: item.discount || 0 
          }];

      // Persist cart to localStorage
      localStorage.setItem('cart', JSON.stringify(updatedCart));

      return { cart: updatedCart };
    });

    // Recalculate total
    const newTotal = get().calculateTotal();
    set({ total: newTotal });
  },

  removeFromCart: (itemCode) => {
    set((state) => {
      const updatedCart = state.cart.filter((i) => i.item_code !== itemCode);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return { cart: updatedCart };
    });
    
    // Calculate and update total after cart is updated
    const newTotal = get().calculateTotal();
    set({ total: newTotal });
  },

  updateQuantity: (itemCode, qty) => {
    if (qty < 1) return; // Prevents negative or zero quantities

    set((state) => {
      const updatedCart = state.cart.map((item) =>
        item.item_code === itemCode ? { ...item, qty: qty } : item
      );

      localStorage.setItem("cart", JSON.stringify(updatedCart));

      return { cart: updatedCart };
    });

    // Recalculate and update the total after updating quantity
    const newTotal = get().calculateTotal();
    set({ total: newTotal });
  },

  updateItem: (itemCode, qty, price, discount = 0) => {
    if (qty < 1) qty = 1;
    
    set((state) => {
      const updatedCart = state.cart.map((i) =>
        i.item_code === itemCode
          ? { 
              ...i, 
              qty, 
              price_list_rate: price, 
              discount // Store discount as a percentage
            }
          : i
      );
      
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return { cart: updatedCart };
    });
    
    // Recalculate total after update
    const newTotal = get().calculateTotal();
    set({ total: newTotal });
  },

  /** 💰 Apply Order-wide Discount */
  setOrderDiscount: (discount) => {
    set({ orderDiscount: discount });
    
    // Calculate and update total after discount is updated
    const newTotal = get().calculateTotal();
    set({ total: newTotal });
  },

  /** 👤 Set Customer */
  // setCustomer: (customer) => {
  //   console.log("Setting customer:", customer); // ✅ Debugging step
  //   set({ customer });
  // },
  setCustomer: (customer) => {
    set({ customer }); // ✅ Update the selected customer globally
    toast.success(`Customer updated: ${customer?.customer_name || "None"}`);
  },

  

  /** 📂 Set Active Category */
  setSelectedCategory: (category) => set({ selectedCategory: category }),

  /** 🧹 Clear Cart and Cache */
  clearCart: () => {
    set({
      cart: [],
      customer: null,
      orderDiscount: 0,
      selectedCategory: "",
      total: 0 // Explicitly set total to 0
    });

    // ✅ Clear localStorage/sessionStorage
    localStorage.removeItem("cart");
    sessionStorage.removeItem("cart");
  },

  /** 🔄 Initialize Cart from Local Storage */
  initializeCart: () => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        set({ cart: parsedCart });
        
        // Calculate total after setting cart
        const newTotal = get().calculateTotal();
        set({ total: newTotal });
      } catch (error) {
        console.error("Error parsing cart from localStorage:", error);
        localStorage.removeItem("cart"); // Remove invalid data
      }
    }
  },
}));