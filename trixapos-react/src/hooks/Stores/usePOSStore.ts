import { create } from 'zustand';
import { CartItem, Customer } from '../../types/pos';
import { toast } from 'sonner';
import { redirect } from 'react-router-dom';

interface ExtendedCartItem extends CartItem {
  discount?: number; // Percentage-based discount
}

interface POSStore {
  cart: ExtendedCartItem[];
  customer: Customer | null;
  total: number;
  orderDiscount: number;
  selectedCategory: string;
  isVerticalLayout: boolean; // Layout preference
  isCompactMode: boolean; // Compact view mode
  // new code for hold order
  holdOrder: (draftName: string, total: number) => void;
  restoreDraftOrder: (draftName: string) => void;
  deleteDraftOrder: (draftName: string) => void;
  getDraftOrders: () => {
      date: Date; name: string; cart: ExtendedCartItem[], total: number
}[];
  
  // Actions
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
  toggleLayout: () => void; // Toggle layouts
  setIsCompactMode: (value: boolean) => void; // Set compact mode
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
  isCompactMode: false, // Default to full view mode 
  // new code for hold order functionality
  holdOrder: (draftName, total) => {
    set((state) => {
      if (!state.cart.length) {
        toast.error("Cannot hold an empty cart.");
        return {};
      }
  
      // Get existing drafts from localStorage
      const existingDrafts = JSON.parse(localStorage.getItem("draftOrders") || "[]");

      // Add new draft to the list
      const newDraft = { date: Date.now().toString(), name: draftName, cart: state.cart, total: total };
      const updatedDrafts = [...existingDrafts, newDraft];
  
      // Save drafts to localStorage
      localStorage.setItem("draftOrders", JSON.stringify(updatedDrafts));
  
      toast.success(`Order "${draftName}" is on hold.`);

      // redirect('trixapos/OrdersPage')
      
      // Clear the current cart after saving
      return { cart: [], total: 0 };
    });
  },


  restoreDraftOrder: (draftName) => {
    set((state) => {
      // Get drafts from localStorage
      const existingDrafts = JSON.parse(localStorage.getItem("draftOrders") || "[]");
  
      // Find the draft by name
      const draft = existingDrafts.find((d) => d.name === draftName);
      if (!draft) {
        toast.error("Draft order not found.");
        return {};
      }
  
      // Remove the draft after restoring
      // const updatedDrafts = existingDrafts.filter((d) => d.name !== draftName);
      // localStorage.setItem("draftOrders", JSON.stringify(updatedDrafts));
  
      toast.success(`Draft "${draftName}" restored.`);
  
      return { date: draft.date, name: draft.name, cart: draft.cart, total: draft.total };
    });
  
    // Recalculate total
    const newTotal = get().calculateTotal();
    set({ total: newTotal });
  },

  
  deleteDraftOrder: (draftName) => {
    set(() => {
      // Get existing drafts
      const existingDrafts = JSON.parse(localStorage.getItem("draftOrders") || "[]");
  
      // Remove the selected draft
      const updatedDrafts = existingDrafts.filter((d) => d.name !== draftName);
  
      // Save updated drafts
      localStorage.setItem("draftOrders", JSON.stringify(updatedDrafts));
  
      toast.success(`Draft "${draftName}" deleted.`);
      return {};
    });
  },

  
  getDraftOrders: () => {
    return JSON.parse(localStorage.getItem("draftOrders") || "[]");
  },
  

  // Toggle layout between vertical and horizontal
  toggleLayout: () =>
    set((state) => {
      localStorage.setItem("isVerticalLayout", JSON.stringify(!state.isVerticalLayout));
      return { isVerticalLayout: !state.isVerticalLayout };
    }),
    
  // Set compact mode
  setIsCompactMode: (value) => 
    set(() => {
      localStorage.setItem("compactMode", JSON.stringify(value));
      return { isCompactMode: value };
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
    // Initialize cart
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
    
    // Initialize UI settings
    const compactMode = localStorage.getItem("compactMode") === "true";
    const verticalLayout = localStorage.getItem("isVerticalLayout") === "true";
    
    set({
      isCompactMode: compactMode,
      isVerticalLayout: verticalLayout
    });
  },
}));