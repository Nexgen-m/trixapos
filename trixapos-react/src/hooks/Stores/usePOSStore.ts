import { create } from "zustand";
import { CartItem, Customer } from "../../types/pos";
import { toast } from "sonner";
import { redirect } from "react-router-dom";

// Define a new type for orders
interface Order {
  id: string;
  timestamp: number; // timestamp in milliseconds (or change to string if needed)
  total: number;
  items: ExtendedCartItem[];
  note?: string;
  paymentMethod?: string;
  reason?: string;
  rejectedBy?: string;
  customer?: string | Customer;
}

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
  holdOrder: (draftName: string, total: number, customer: string) => void;
  restoreDraftOrder: (draftName: string) => void;
  deleteDraftOrder: (draftName: string) => void;
  getDraftOrders: () => {
    date: Date;
    name: string;
    cart: ExtendedCartItem[];
    total: number;
    customer: string;
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

  // New properties for OrdersScreen functionality
  heldOrders: Order[];
  completedOrders: Order[];
  rejectedOrders: Order[];
  loadHeldOrder: (id: string) => void;
  removeHeldOrder: (id: string) => void;
  resendOrderEmail: (orderId: string, email: string) => Promise<void>;
}

export const usePOSStore = create<POSStore>((set, get) => ({
  cart: [],
  customer: null,
  total: 0,
  orderDiscount: 0,
  selectedCategory: "",
  isVerticalLayout: JSON.parse(localStorage.getItem("isVerticalLayout") || "false"),
  isCompactMode: false, // Default to full view mode

  
  // Toggle layout between vertical and horizontal
  toggleLayout: async () => {
    set((state) => {
      const newLayout = !state.isVerticalLayout;
      localStorage.setItem("isVerticalLayout", JSON.stringify(newLayout));
      return { isVerticalLayout: newLayout };
    });
  },
  // Toggle layout between horizontal and vertical
  
  // new code for hold order functionality
  holdOrder: (draftName, total, customer) => {
    set((state) => {
      if (!state.cart.length) {
        toast.error("Cannot hold an empty cart.");
        return {};
      }

      // Get existing drafts from localStorage
      const existingDrafts = JSON.parse(
        localStorage.getItem("draftOrders") || "[]"
      );

      // Add new draft to the list
      const newDraft = {
        date: Date.now(),
        name: draftName,
        cart: state.cart,
        total: total,
        customer: customer
      };
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
      const existingDrafts = JSON.parse(
        localStorage.getItem("draftOrders") || "[]"
      );

      // Find the draft by name
      const draft = existingDrafts.find(
        (d: { name: string }) => d.name === draftName
      );
      if (!draft) {
        toast.error("Draft order not found.");
        return {};
      }

      // Remove the draft after restoring
      // const updatedDrafts = existingDrafts.filter((d) => d.name !== draftName);
      // localStorage.setItem("draftOrders", JSON.stringify(updatedDrafts));

      toast.success(`Draft "${draftName}" restored.`);

      return {
        date: draft.date,
        name: draft.name,
        cart: draft.cart,
        total: draft.total,
        customer: draft.customer
      };
    });

    // Recalculate total
    const newTotal = get().calculateTotal();
    const customer1 = get().customer;
    set({ total: newTotal, customer: {
      customer_name: customer1?.customer_name || "Grant Plastics Ltd.",
      name: customer1?.name || "",
      customer_group: customer1?.customer_group || "",
      default_price_list: customer1?.default_price_list || "",
      territory: customer1?.territory || ""
    } });
  },

  deleteDraftOrder: (draftName) => {
    set(() => {
      // Get existing drafts
      const existingDrafts = JSON.parse(
        localStorage.getItem("draftOrders") || "[]"
      );

      // Remove the selected draft
      const updatedDrafts = existingDrafts.filter(
        (d: { name: string }) => d.name !== draftName
      );

      // Save updated drafts
      localStorage.setItem("draftOrders", JSON.stringify(updatedDrafts));

      toast.success(`Draft "${draftName}" deleted.`);
      return {};
    });
  },

  getDraftOrders: () => {
    return JSON.parse(localStorage.getItem("draftOrders") || "[]");
  },

  // New OrdersScreen properties and actions
  heldOrders: [],
  completedOrders: [],
  rejectedOrders: [],
  loadHeldOrder: (id: string) => {
    const order = get().heldOrders.find((o) => o.id === id);
    if (order) {
      // For example, set the cart to the order's items and total
      set({ cart: order.items, total: order.total });
      toast.success(`Loaded held order ${order.id}`);
    } else {
      toast.error("Held order not found.");
    }
  },
  removeHeldOrder: (id: string) => {
    set((state) => {
      const updatedHeldOrders = state.heldOrders.filter((o) => o.id !== id);
      toast.success(`Removed held order ${id}`);
      return { heldOrders: updatedHeldOrders };
    });
  },
  resendOrderEmail: async (orderId: string, email: string) => {
    // Simulate sending an email
    toast.success(`Email sent for order ${orderId} to ${email}`);
    return Promise.resolve();
  },

  // Set compact mode
  setIsCompactMode: (value) =>
    set(() => {
      localStorage.setItem("compactMode", JSON.stringify(value));
      return { isCompactMode: value };
    }),

  calculateTotal: () => {
    const { cart, orderDiscount } = get();

    // Calculate total with percentage-based discounts
    const calculatedTotal =
      cart.reduce((sum, item) => {
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
    // set({ total: finalTotal });
    set((state) => {
      const updatedTotal =
        state.cart.reduce((sum, item) => {
          const itemTotal = item.price_list_rate * item.qty;
          const discountAmount = itemTotal * ((item.discount || 0) / 100);
          return sum + (itemTotal - discountAmount);
        }, 0) - state.orderDiscount;

      return { total: Math.max(0, updatedTotal) };
    });

    return finalTotal;
  },

  addToCart: (item) => {
    // Validate item price
    if (!item.price_list_rate || item.price_list_rate <= 0) {
      toast.error(
        `Item "${item.item_name}" must have a valid price before adding to the cart.`
      );
      return;
    }

    set((state) => {
      // Check if item already exists in cart
      const existingItem = state.cart.find(
        (i) => i.item_code === item.item_code
      );

      const updatedCart = existingItem
        ? state.cart.map((i) =>
            i.item_code === item.item_code
              ? {
                  ...i,
                  qty: i.qty + 1,
                  // Preserve or set discount percentage
                  discount: item.discount || i.discount || 0,
                }
              : i
          )
        : [
            ...state.cart,
            {
              ...item,
              qty: 1,
              // Ensure discount percentage is set
              discount: item.discount || 0,
            },
          ];

      // Persist cart to localStorage
      localStorage.setItem("cart", JSON.stringify(updatedCart));

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
              discount, // Store discount as a percentage
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
      total: 0,
    });

    // ✅ Clear localStorage/sessionStorage
    localStorage.removeItem("cart");
    sessionStorage.removeItem("cart");
  },

  /** 🔄 Initialize Cart from Local Storage */
  initializeCart: () => {
    // Initialize cart
    const savedCart = localStorage.getItem("cart");
    const compactMode = localStorage.getItem("compactMode") === "true";
    const verticalLayout = localStorage.getItem("isVerticalLayout") === "true";

    set(() => ({
      cart: savedCart ? JSON.parse(savedCart) : [],
      isCompactMode: compactMode,
      isVerticalLayout: verticalLayout,
      total: savedCart
        ? JSON.parse(savedCart).reduce(
            (sum: number, item: ExtendedCartItem) => {
              const itemTotal = item.price_list_rate * item.qty;
              const discountAmount = itemTotal * ((item.discount || 0) / 100);
              return sum + (itemTotal - discountAmount);
            },
            0
          )
        : 0,
    }));
    
    set({
      isVerticalLayout: verticalLayout
    });
  },
}));
