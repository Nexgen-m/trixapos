import { create } from "zustand";
import { CartItem, Customer } from "../../types/pos";
import { toast } from "sonner";
import {
  saveOrderOffline,
  getOfflineOrders,
  removeOfflineOrder,
} from "@/lib/db";
import { redirect } from "react-router-dom";

// Import custom Frappe API helper. This wrapper around the frappe-js-sdk's call method
// is used to perform online API calls for draft sales orders.
import { fetchFromFrappe } from "@/lib/frappeApi";

// Define a new type for orders
interface Order {
  id: string;
  timestamp: number; // timestamp in milliseconds
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
  isFullScreenMode: boolean; // Full screen mode

  initializeHeldOrders: () => Promise<void>;
  // Order-related functions
  holdOrder: (draftName: string, total: number, customer: Customer) => void; // NW: changed parameter type to Customer
  restoreDraftOrder: (draftName: string) => void;
  deleteDraftOrder: (draftName: string) => void;
  getDraftOrders: () => Promise<
    {
      id: string;
      timestamp: number;
      total: number;
      items: ExtendedCartItem[];
      note?: string;
      customer?: string | Customer;
    }[]
  >;
  loadHeldOrder: (id: string) => void;
  removeHeldOrder: (id: string) => void;
  resendOrderEmail: (orderId: string, email: string) => Promise<void>;

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
  setIsFullScreenMode: (value: boolean) => void; // Set full screen mode
  setOrderDiscount: (discount: number) => void;
  setSelectedCategory: (category: string) => void;
  clearCart: () => void;
  initializeCart: () => void;
  calculateTotal: () => number;

  // New properties for OrdersScreen functionality
  heldOrders: Order[];
  completedOrders: Order[];
  rejectedOrders: Order[];
}

export const usePOSStore = create<POSStore>((set, get) => ({
  cart: [],
  customer: null,
  total: 0,
  orderDiscount: 0,
  selectedCategory: "",
  isVerticalLayout: JSON.parse(
    localStorage.getItem("isVerticalLayout") || "false"
  ),
  isCompactMode: false,
  isFullScreenMode: false,
  heldOrders: [],
  completedOrders: [],
  rejectedOrders: [],

  // Add this function to initialize held orders from IndexedDB
  initializeHeldOrders: async () => {
    try {
      const orders = await getOfflineOrders();
      set({ heldOrders: orders });
    } catch (error) {
      console.error("Failed to initialize held orders:", error);
    }
  },

  // Hold order functionality
  holdOrder: async (draftName, total, customer) => {
    const state = get(); // Get the current state

    if (!state.cart.length) {
      toast.error("Cannot hold an empty cart.");
      return;
    }

    // Create new held order
    const newHeldOrder = {
      id: `hold-${Date.now()}`, // Unique ID
      timestamp: Date.now(),
      total,
      items: state.cart,
      note: draftName,
      customer, // NW: Modified to store the full Customer object instead of just a string.
    };

    // Save the order offline to IndexedDB
    await saveOrderOffline(newHeldOrder);

    // Update the state
    set((state) => ({
      heldOrders: [...state.heldOrders, newHeldOrder],
      cart: [], // Clear the cart after holding
      total: 0, // Reset the total
    }));
  },

  // Restore draft order from IndexedDB
  restoreDraftOrder: async (draftName) => {
    try {
      // Fetch all draft orders from IndexedDB
      const existingDrafts = await getOfflineOrders();

      // Find the draft by name
      const draft = existingDrafts.find(
        (d: { note: string }) => d.note === draftName
      );
      if (!draft) {
        toast.error("Draft order not found.");
        return;
      }

      // Update the state with the restored draft
      set((state) => ({
        cart: draft.items,
        total: draft.total,
        customer: draft.customer,
      }));

      toast.success(`Draft "${draftName}" restored.`);
    } catch (error) {
      toast.error("Failed to restore draft order.");
      console.error(error);
    }
  },

  // Delete draft order from IndexedDB
  deleteDraftOrder: async (draftName) => {
    try {
      // Fetch all draft orders from IndexedDB
      const existingDrafts = await getOfflineOrders();

      // Find the draft by name
      const draft = existingDrafts.find(
        (d: { note: string }) => d.note === draftName
      );
      if (!draft) {
        toast.error("Draft order not found.");
        return;
      }

      // Remove the draft from IndexedDB
      await removeOfflineOrder(draft.id);

      // Update the state
      set((state) => ({
        heldOrders: state.heldOrders.filter((o) => o.id !== draft.id),
      }));

      toast.success(`Draft "${draftName}" deleted.`);
    } catch (error) {
      toast.error("Failed to delete draft order.");
      console.error(error);
    }
  },

  // Get all draft orders from IndexedDB
  getDraftOrders: async () => {
    try {
      const drafts = await getOfflineOrders();
      console.log("drafts: " + drafts);
      return drafts;
    } catch (error) {
      toast.error("Failed to fetch draft orders.");
      console.error(error);
      return [];
    }
  },

  // Load a held order into the cart
  loadHeldOrder: async (id: string) => {
    const order = get().heldOrders.find((o) => o.id === id);
    if (order) {
      let customerData: Customer | null = null;
      if (order.customer) {
        if (typeof order.customer === "string") {
          customerData = {
            name: order.customer,
            customer_name: order.customer,
          } as Customer;
        } else {
          customerData = order.customer;
        }
      }
      set({ cart: order.items, total: order.total, customer: customerData });
      toast.success(`Loaded held order ${order.id}`);
    } else {
      // If the order is not in the state, try fetching it from IndexedDB
      try {
        const dbOrder = await getOfflineOrders();
        const orderFromDB = dbOrder.find((o) => o.id === id);
        if (orderFromDB) {
          let customerData: Customer | null = null;
          if (orderFromDB.customer) {
            if (typeof orderFromDB.customer === "string") {
              customerData = {
                name: orderFromDB.customer,
                customer_name: orderFromDB.customer,
              } as Customer;
            } else {
              customerData = orderFromDB.customer;
            }
          }
          set({
            cart: orderFromDB.items,
            total: orderFromDB.total,
            customer: customerData,
          });
          toast.success(`Loaded held order ${orderFromDB.id}`);
        } else {
          toast.error("Held order not found.");
        }
      } catch (error) {
        toast.error("Failed to load held order from IndexedDB.");
        console.error(error);
      }
    }
  },

  // Remove a held order from the state and IndexedDB
  removeHeldOrder: async (id: string) => {
    try {
      // Remove the order from IndexedDB
      await removeOfflineOrder(id);

      // Update the state
      set((state) => {
        const updatedHeldOrders = state.heldOrders.filter((o) => o.id !== id);
        return { heldOrders: updatedHeldOrders };
      });

      toast.success(`Removed held order ${id}`);
    } catch (error) {
      toast.error("Failed to remove held order.");
      console.error(error);
    }
  },

  // Simulate sending an email for an order
  resendOrderEmail: async (orderId: string, email: string) => {
    // Simulate sending an email
    toast.success(`Email sent for order ${orderId} to ${email}`);
    return Promise.resolve();
  },

  // Toggle layout between vertical and horizontal
  toggleLayout: () => {
    const currentLayout = get().isVerticalLayout;
    const newLayout = !currentLayout;

    // Save the new layout preference to localStorage
    localStorage.setItem("isVerticalLayout", JSON.stringify(newLayout));

    // Reset the POS screen
    set({
      isVerticalLayout: newLayout,
      cart: [], // Clear the cart
      selectedCategory: "", // Reset the selected category
      total: 0, // Reset the total
    });

    // Optionally, you can trigger a page reload here
    window.location.reload();
  },

  // Set full screen mode
  setIsFullScreenMode: (value: boolean) => {
    set({ isFullScreenMode: value });
  },

  // Set compact mode
  setIsCompactMode: (value) => {
    localStorage.setItem("compactMode", JSON.stringify(value));
    return set({ isCompactMode: value });
  },

  // Calculate total with discounts
  calculateTotal: () => {
    const { cart, orderDiscount } = get();

    const calculatedTotal =
      cart.reduce((sum, item) => {
        const itemTotal = item.price_list_rate * item.qty;
        const itemDiscountAmount = itemTotal * ((item.discount || 0) / 100);
        return sum + (itemTotal - itemDiscountAmount);
      }, 0) - orderDiscount;

    const finalTotal = Math.max(0, calculatedTotal);

    set({ total: finalTotal });
    return finalTotal;
  },

  // Add item to cart
  addToCart: (item) => {
    if (!item.price_list_rate || item.price_list_rate <= 0) {
      toast.error(
        `Item "${item.item_name}" must have a valid price before adding to the cart.`
      );
      return;
    }

    set((state) => {
      const existingItem = state.cart.find(
        (i) => i.item_code === item.item_code
      );

      const updatedCart = existingItem
        ? state.cart.map((i) =>
            i.item_code === item.item_code
              ? {
                  ...i,
                  qty: i.qty + 1,
                  discount: item.discount || i.discount || 0,
                }
              : i
          )
        : [...state.cart, { ...item, qty: 1, discount: item.discount || 0 }];

      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return { cart: updatedCart };
    });

    const newTotal = get().calculateTotal();
    set({ total: newTotal });
  },

  // Remove item from cart
  removeFromCart: (itemCode) => {
    set((state) => {
      const updatedCart = state.cart.filter((i) => i.item_code !== itemCode);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return { cart: updatedCart };
    });

    const newTotal = get().calculateTotal();
    set({ total: newTotal });
  },

  // Update item quantity
  updateQuantity: (itemCode, qty) => {
    if (qty < 1) return;

    set((state) => {
      const updatedCart = state.cart.map((item) =>
        item.item_code === itemCode ? { ...item, qty: qty } : item
      );

      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return { cart: updatedCart };
    });

    const newTotal = get().calculateTotal();
    set({ total: newTotal });
  },

  // Update item details
  updateItem: (itemCode, qty, price, discount = 0) => {
    if (qty < 1) qty = 1;

    set((state) => {
      const updatedCart = state.cart.map((i) =>
        i.item_code === itemCode
          ? { ...i, qty, price_list_rate: price, discount }
          : i
      );

      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return { cart: updatedCart };
    });

    const newTotal = get().calculateTotal();
    set({ total: newTotal });
  },

  // Set order discount
  setOrderDiscount: (discount) => {
    set({ orderDiscount: discount });
    const newTotal = get().calculateTotal();
    set({ total: newTotal });
  },

  // Set customer
  setCustomer: (customer) => {
    set({ customer });
  },

  // Set selected category
  setSelectedCategory: (category) => set({ selectedCategory: category }),

  // Clear cart
  clearCart: () => {
    set({
      cart: [],
      customer: null,
      orderDiscount: 0,
      selectedCategory: "",
      total: 0,
    });
    localStorage.removeItem("cart");
    sessionStorage.removeItem("cart");
  },

  // Initialize cart from localStorage
  initializeCart: () => {
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
  },
}));
