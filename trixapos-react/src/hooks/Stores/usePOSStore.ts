import { create } from "zustand";
import { CartItem, Customer } from "../../types/pos";
import { toast } from "sonner";
import {
  saveOrderOffline,
  getOfflineOrders,
  removeOfflineOrder,
  getInvoicesOffline,
  deleteInvoiceOffline,
  updateInvoiceOffline,
  saveInvoiceOffline,
} from "@/lib/db";
import { redirect } from "react-router-dom";
// Import our custom Frappe API helper. This wrapper around the frappe-js-sdk's call method
// is used to perform online API calls for draft sales orders.
import { fetchFromFrappe } from "@/lib/frappeApi";
import { createDraftOrder } from "@/lib/createDraftOrder";
import { fetchWithCredentials } from "@/lib/fetchWithCredentials";
import { postWithCredentials } from "@/lib/postWithCredentials";
import { createInvoice } from "@/lib/createInvoice";

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

// invoice  >>

// types/invoice.ts
export interface InvoiceItem {
  item_code: string;
  item_name: string;
  qty: number;
  rate: number;
  discount?: number;
  amount: number;
}

export interface Invoice {
  id: string; // Unique identifier for the invoice
  customer: string | Customer; // Customer associated with the invoice
  items: ExtendedCartItem[]; // List of items in the invoice
  total: number; // Total amount of the invoice
  timestamp: number; // Timestamp of invoice creation
  status: "Draft" | "Paid" | "Cancelled"; // Invoice status
  paymentMethod?: string; // Payment method used
  note?: string; // Additional notes for the invoice
}

// invoice <<

interface POSStore {
  cart: ExtendedCartItem[];
  customer: Customer | null;
  total: number;
  orderDiscount: number;
  selectedCategory: string;
  isVerticalLayout: boolean; // Layout preference
  isCompactMode: boolean; // Compact view mode
  isFullScreenMode: boolean; // Full screen mode
  invoices: Invoice[]; // List of invoices
  currentInvoice: Invoice | null; // Currently selected invoice

  initializeHeldOrders: () => Promise<void>;
  // Order-related functions
  holdOrder: (draftName: string, total: number, customer: Customer) => void;
  restoreDraftOrder: (draftName: string) => void;
  deleteDraftOrder: (draftName: string) => void;
  getDraftOrders: () => Promise<Order[]>;
  loadHeldOrder: (id: string) => void;
  removeHeldOrder: (id: string) => void;
  resendOrderEmail: (orderId: string, email: string) => Promise<void>;

  // Invoice-related functions
  createInvoice: (invoice: any) => Promise<void>;
  updateInvoice: (
    id: string,
    updatedInvoice: Partial<Invoice>
  ) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  getInvoices: () => Promise<Invoice[]>;
  loadInvoice: (id: string) => void;
  syncInvoices: () => Promise<void>; // Sync offline invoices when online

  // New function for syncing offline orders when back online
  syncOfflineOrders: () => Promise<void>;

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
  toggleLayout: () => void;
  setIsCompactMode: (value: boolean) => void;
  setIsFullScreenMode: (value: boolean) => void;
  setOrderDiscount: (discount: number) => void;
  setSelectedCategory: (category: string) => void;
  clearCart: () => void;
  initializeCart: () => void;
  calculateTotal: () => number;
  syncCompactModeFromProfile: (isCompact: boolean) => void;

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
  invoices: [],
  currentInvoice: null,

  syncCompactModeFromProfile: (isCompact) => {
    localStorage.setItem("compactMode", JSON.stringify(isCompact));
    set({ isCompactMode: isCompact });
  },

  // Initialize held orders from IndexedDB
  initializeHeldOrders: async () => {
    try {
      const orders = await getOfflineOrders();
      set({ heldOrders: orders });
    } catch (error) {
      console.error("Failed to initialize held orders:", error);
    }
  },

  // Hold order functionality with online/offline support
  holdOrder: async (draftName, total, customer) => {
    const state = get();
    if (!state.cart.length) {
      toast.error("Cannot hold an empty cart.");
      return;
    }

    // Build order payload from current state
    const orderPayload = {
      customer: customer?.name || "Guest Customer",
      total,
      note: draftName,
      company: "Nexgen Solutions", //mandatory
      transaction_date: new Date(), // Format as YYYY-MM-DD
      items: state.cart.map((item) => ({
        item_code: item.item_code,
        // item_name can be included if needed on the backend,
        qty: item.qty,
        rate: item.price_list_rate || 0,
        discount: item.discount || 0,
      })),
      timestamp: Date.now(),
    };

    if (navigator.onLine) {
      try {
        // Use the new createDraftOrder function
        const response = await createDraftOrder(orderPayload);
        if (response.success) {
          // Clear the cart and total once saved online.
          set({ cart: [], total: 0 });
          // Refresh the list of orders.
          await get().getDraftOrders();
          return;
        } else {
          throw new Error(response.error);
        }
      } catch (error) {
        toast.error("Failed to save online. Saving order offline instead.");
        console.log(error);
      }
    }

    // Offline fallback: generate a unique id with "offline-" prefix.
    const offlineOrder: Order = {
      id: `offline-${Date.now()}`,
      customer: customer?.name || "Guest Customer",
      total,
      note: draftName,
      items: state.cart.map((item) => ({
        item_code: item.item_code,
        item_name: item.item_name, // Ensure item_name is included
        qty: item.qty,
        price_list_rate: item.price_list_rate || 0, // Ensure rate is provided
        discount: item.discount || 0, // Ensure discount is provided
        item_group: item.item_group || "Default Group", // Add missing property
        name: item.name || item.item_name, // Add missing property
        stock_qty: item.stock_qty || 0, // Add missing property
      })),
      timestamp: Date.now(), // Optional, not used in ERPNext
    };

    await saveOrderOffline(offlineOrder);

    // Debugging: Log the offline order and current state
    console.log("Offline Order:", offlineOrder);
    console.log("Current Held Orders:", state.heldOrders);

    // Update the state
    set((state) => ({
      ...state, // Preserve other state properties
      heldOrders: [...state.heldOrders, offlineOrder],
      cart: [],
      total: 0,
    }));
  },

  // Restore draft order from IndexedDB
  restoreDraftOrder: async (draftName) => {
    try {
      const existingDrafts = await getOfflineOrders();
      const draft = existingDrafts.find(
        (d: { note: string }) => d.note === draftName
      );
      if (!draft) {
        toast.error("Draft order not found.");
        return;
      }
      set({ cart: draft.items, total: draft.total, customer: draft.customer });
      toast.success(`Draft "${draftName}" restored.`);
    } catch (error) {
      toast.error("Failed to restore draft order.");
      console.error(error);
    }
  },

  // Delete draft order from IndexedDB
  deleteDraftOrder: async (draftName) => {
    try {
      const existingDrafts = await getOfflineOrders();
      const draft = existingDrafts.find(
        (d: { note: string }) => d.note === draftName
      );
      if (!draft) {
        toast.error("Draft order not found.");
        return;
      }
      await removeOfflineOrder(draft.id);
      set((state) => ({
        heldOrders: state.heldOrders.filter((o) => o.id !== draft.id),
      }));
      toast.success(`Draft "${draftName}" deleted.`);
    } catch (error) {
      toast.error("Failed to delete draft order.");
      console.error(error);
    }
  },

  // For online orders, we call our ERPNext API endpoint to get Sales Orders in draft state.
  // We map each online order using its ERPNext-generated 'name' as the order ID,
  // and extract fields such as creation date (mapped to timestamp), total, custom_note, and customer.
  // Offline orders already have IDs in the format "offline-{timestamp}".

  // Get all draft orders merging online and offline orders.
  // For online orders, we call our ERPNext API endpoint using fetchWithCredentials to include credentials.
  getDraftOrders: async () => {
    let onlineOrders: Order[] = [];

    if (navigator.onLine) {
      try {
        // (1) Basic fields from resource list
        const mainResponse = await fetchWithCredentials(
          `http://38.242.204.206:8001/api/resource/Sales Order?fields=["name","customer_name","total","creation"]&filters=[["docstatus","=","0"]]`
        );

        if (!Array.isArray(mainResponse.data)) {
          throw new Error("Expected mainResponse.data to be an array");
        }

        // (2) For each top-level order doc, fetch items
        const fetchedOrders = await Promise.all(
          mainResponse.data.map(async (doc: any) => {
            let items: any[] = [];
            try {
              // fetch the items for this specific Sales Order
              const itemResponse = await fetchWithCredentials(
                `http://38.242.204.206:8001/api/resource/Sales Order/${doc.name}?fields=["items"]`
              );
              items = itemResponse.data?.items || [];
            } catch (err) {
              console.error("Failed to fetch items for", doc.name, err);
            }

            return {
              id: doc.name,
              timestamp: new Date(doc.creation).getTime(),
              total: doc.total,
              customer: doc.customer_name,
              items: items.map((child: any) => ({
                item_code: child.item_code,
                item_name: child.item_name,
                // Make sure we provide the field your CartItem expects:
                price_list_rate: child.rate || 0,
                qty: child.qty || 1,
                discount: child.discount_percentage || 0,
              })),
            };
          })
        );

        onlineOrders = fetchedOrders;
      } catch (error) {
        console.error("API Error:", error);
        toast.error("Failed to fetch online orders");
      }
    }

    const offlineOrders = await getOfflineOrders();
    const mergedOrders = [...offlineOrders, ...onlineOrders];
    console.log("Merged draft orders:", mergedOrders);

    set({ heldOrders: mergedOrders });
    return mergedOrders;
  },

  // Load a held order into the cart
  loadHeldOrder: async (id: string) => {
    const order = get().heldOrders.find((o) => o.id === id);
    if (order) {
      let customerData: Customer | null = null;
      if (order.customer) {
        customerData =
          typeof order.customer === "string"
            ? ({
                name: order.customer,
                customer_name: order.customer,
              } as Customer)
            : order.customer;
      }
      set({ cart: order.items, total: order.total, customer: customerData });
      toast.success(`Loaded held order ${order.id}`);
    } else {
      try {
        const dbOrder = await getOfflineOrders();
        const orderFromDB = dbOrder.find((o) => o.id === id);
        if (orderFromDB) {
          let customerData: Customer | null = null;
          if (orderFromDB.customer) {
            customerData =
              typeof orderFromDB.customer === "string"
                ? ({
                    name: orderFromDB.customer,
                    customer_name: orderFromDB.customer,
                  } as Customer)
                : orderFromDB.customer;
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

  // Remove a held order from both online and offline storage.
  // For online orders, instead of deleting, we call a cancellation endpoint and then
  // move the order to the rejectedOrders array.
  removeHeldOrder: async (id: string) => {
    try {
      if (id.startsWith("offline-")) {
        // Offline order
        await removeOfflineOrder(id);
        set((state) => ({
          heldOrders: state.heldOrders.filter((o) => o.id !== id),
        }));
        toast.success(`Removed held order ${id}`);
      } else if (navigator.onLine) {
        // Online order - call new delete endpoint
        const response = await postWithCredentials(
          "trixapos.api.sales_order.delete_draft_order",
          { data: JSON.stringify({ order_id: id }) }
        );

        if (!response.success) throw new Error(response.error);

        // Remove from state on success
        set((state) => ({
          heldOrders: state.heldOrders.filter((o) => o.id !== id),
        }));
        toast.success(`Deleted order ${id}`);
      }
    } catch (error) {
      toast.error("Failed to delete order.");
      console.error(error);
    }
  },

  // Sync offline orders to ERPNext when online.
  // For each offline order, call the ERPNext API to create a Sales Order.
  // On successful creation, remove the offline order from IndexedDB and refresh the order list.
  syncOfflineOrders: async () => {
    if (!navigator.onLine) return;
    const offlineOrders = await getOfflineOrders();

    for (const order of offlineOrders) {
      try {
        // POST to create_draft_sales_order with { data: JSON.stringify(order) }
        const response = await postWithCredentials(
          "trixapos.api.sales_order.create_draft_sales_order",
          { data: JSON.stringify(order) }
        );
        if (response.success) {
          await removeOfflineOrder(order.id);
          toast.success(`Synced offline order ${order.id}`);
        } else {
          throw new Error(response.error);
        }
      } catch (error) {
        console.error("Failed to sync offline order", order.id, error);
      }
    }

    await get().getDraftOrders();
  },

  // Simulate sending an email for an order
  resendOrderEmail: async (orderId: string, email: string) => {
    toast.success(`Email sent for order ${orderId} to ${email}`);
    return Promise.resolve();
  },

  // Toggle layout between vertical and horizontal
  toggleLayout: () => {
    const currentLayout = get().isVerticalLayout;
    const newLayout = !currentLayout;
    localStorage.setItem("isVerticalLayout", JSON.stringify(newLayout));
    set({
      isVerticalLayout: newLayout,
      cart: [],
      selectedCategory: "",
      total: 0,
    });
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

  // completed orders when payment by cashmatic is done
  // Create a new invoice
  createInvoice: async (invoice) => {
    // const newInvoice: Invoice = {
    //   ...invoice,
    //   id: `invoice-${Date.now()}`, // Generate a unique ID
    //   timestamp: Date.now(), // Set creation timestamp
    //   status: "Paid", // Default status
    //   customer: customer?.name || "Guest Customer"
    // };
    let success = false;
    if (navigator.onLine) {
      try {
        // Call the API to create the invoice online
        const response = await createInvoice(invoice);
        if (response.success) {
          // Clear the cart and total once saved online.
          set({ cart: [], total: 0 });
          // Refresh the list of invoices.
          // await get().getInvoices();
          // Redirect to the invoice page
          // redirect(`/trixapos/OrderScreen/`);
          
          // Show success message
          toast.success("Invoice created online!");
          success = true;
          set((state) => ({ invoices: [...state.invoices, invoice] }));
          return;
        } else {
          throw new Error(response.error);
        }
      } catch (error) {
        toast.error("Failed to create invoice online. Saving offline.");
        console.error(error);
      }
    }

    // Offline fallback: Save to IndexedDB
    console.log("invoice from posstore: ", invoice);
    !success && (await saveInvoiceOffline(invoice));
    set((state) => ({ invoices: [...state.invoices, invoice] }));
  },

  // Update an existing invoice
  updateInvoice: async (id, updatedInvoice) => {
    const state = get();
    const existingInvoice = state.invoices.find((inv) => inv.id === id);
    if (!existingInvoice) {
      toast.error("Invoice not found.");
      return;
    }

    const updated = { ...existingInvoice, ...updatedInvoice };

    if (navigator.onLine) {
      try {
        // Call the API to update the invoice online
        const response = await fetchFromFrappe(
          "trixapos.api.invoice.update_invoice",
          {
            args: { id, ...updatedInvoice },
          }
        );
        if (response.success) {
          toast.success("Invoice updated online!");
          set((state) => ({
            invoices: state.invoices.map((inv) =>
              inv.id === id ? updated : inv
            ),
          }));
        } else {
          throw new Error(response.error);
        }
      } catch (error) {
        toast.error("Failed to update invoice online. Updating offline.");
        console.error(error);
      }
    }

    // Offline fallback: Update in IndexedDB
    await updateInvoiceOffline(updated);
    set((state) => ({
      invoices: state.invoices.map((inv) => (inv.id === id ? updated : inv)),
    }));
  },

  // Delete an invoice
  deleteInvoice: async (id) => {
    if (navigator.onLine) {
      try {
        // Call the API to delete the invoice online
        const response = await fetchFromFrappe(
          "trixapos.api.invoice.delete_invoice",
          {
            args: { id },
          }
        );
        if (response.success) {
          toast.success("Invoice deleted online!");
          set((state) => ({
            invoices: state.invoices.filter((inv) => inv.id !== id),
          }));
        } else {
          throw new Error(response.error);
        }
      } catch (error) {
        toast.error("Failed to delete invoice online. Deleting offline.");
        console.error(error);
      }
    }

    // Offline fallback: Delete from IndexedDB
    await deleteInvoiceOffline(id);
    set((state) => ({
      invoices: state.invoices.filter((inv) => inv.id !== id),
    }));
  },

  // Get all invoices (merge online and offline)

  getInvoices: async () => {
    let onlineInvoices: Invoice[] = [];
    if (navigator.onLine) {
      try {
        const response = await fetch(
          `http://38.242.204.206:8001/api/resource/Sales Invoice?fields=["name","customer_name","grand_total","posting_date","posting_time","status","items"]&expand=items`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
          }
        );
        const responseData = await response.json();
        ////
        const fetchedOrders = await Promise.all(
          responseData.data.map(async (inv: any) => {
            let items: any[] = [];
            try {
              // fetch the items for this specific Sales Order
              const itemResponse = await fetchWithCredentials(
                `http://38.242.204.206:8001/api/resource/Sales Invoice/${inv.name}?fields=["items"]`
              );
              items = itemResponse.data?.items || [];
            } catch (err) {
              console.error("Failed to fetch items for", inv.name, err);
            }

            return {
              id: inv.name,
              timestamp:
                inv.posting_date &&
                inv.posting_time &&
                !isNaN(
                  new Date(`${inv.posting_date}T${inv.posting_time}`).getTime()
                )
                  ? new Date(
                      `${inv.posting_date}T${inv.posting_time}`
                    ).getTime()
                  : new Date().getTime(), // Handle missing or invalid posting_date or posting_time
              status: inv.status || "Unknown", // Default status if undefined
              total: inv.grand_total || 0, // Default total if undefined
              customer: inv.customer_name,
              items: items.map((child: any) => ({
                item_code: child.item_code,
                item_name: child.item_name,
                // Make sure we provide the field your CartItem expects:
                price_list_rate: child.rate || 0,
                qty: child.qty || 1,
                discount: child.discount_percentage || 0,
              })),
            };
          })
        );

        onlineInvoices = fetchedOrders;
        console.log("OnlineInvoices: ", onlineInvoices);
      } catch (error) {
        toast.error("Error fetching online invoices.");
        console.error(error);
      }
    }

    const offlineInvoices = await getInvoicesOffline();
    console.log("Offline invoices: ", offlineInvoices);
    const mergedInvoices = [...offlineInvoices, ...onlineInvoices];
    set({ invoices: mergedInvoices });
    return mergedInvoices;
  },
  // Load a specific invoice
  loadInvoice: (id) => {
    const invoice = get().invoices.find((inv) => inv.id === id);
    if (invoice) {
      set({ currentInvoice: invoice });
      toast.success(`Loaded invoice ${id}`);
    } else {
      toast.error("Invoice not found.");
    }
  },

  // Sync offline invoices when online
  syncInvoices: async () => {
    if (!navigator.onLine) return;
    const offlineInvoices = await getInvoicesOffline();
    for (const invoice of offlineInvoices) {
      try {
        const response = await fetchFromFrappe(
          "trixapos.api.sales_invoice.create_sales_invoice",
          {
            args: invoice,
          }
        );
        if (response.success) {
          await deleteInvoiceOffline(invoice.id);
          toast.success(`Synced offline invoice ${invoice.id}`);
        } else {
          throw new Error(response.error);
        }
      } catch (error) {
        console.error("Failed to sync offline invoice", invoice.id, error);
      }
    }
    await get().getInvoices();
  },
}));
