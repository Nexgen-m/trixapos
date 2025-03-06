// import { create } from 'zustand';
// import { CartItem, Customer } from '../../types/pos';
// import { Toaster, toast } from 'sonner'; // Import the Toaster component and toast function

// interface POSStore {
//   cart: CartItem[];
//   customer: Customer | null;
//   total: number;
//   orderDiscount: number;
//   selectedCategory: string;
//   addToCart: (item: CartItem) => void;
//   removeFromCart: (itemCode: string) => void;
//   updateQuantity: (itemCode: string, qty: number) => void;
//   updateItem: (itemCode: string, qty: number, price: number, discount: number) => void;
//   setCustomer: (customer: Customer | null) => void;
//   setOrderDiscount: (discount: number) => void;
//   setSelectedCategory: (category: string) => void;
//   clearCart: () => void;
//   initializeCart: () => void;
//   calculateTotal: () => number; // Adding return type for clarity
  
  
  
// }

// export const usePOSStore = create<POSStore>((set, get) => ({
//   cart: [],
//   customer: null,
//   total: 0,
//   orderDiscount: 0,
//   selectedCategory: "",

//   /** 🔄 Utility: Calculate Cart Total */
//   calculateTotal: () => {
//     const { cart, orderDiscount } = get();
    
//     console.log('Cart Contents:', cart);
//     console.log('Order Discount:', orderDiscount);
    
//     const cartDetails = cart.map(item => ({
//       itemCode: item.item_code,
//       price: item.price_list_rate,
//       quantity: item.qty,
//       itemDiscount: item.discount || 0,
//       itemTotal: item.price_list_rate * item.qty,
//       itemTotalAfterDiscount: item.price_list_rate * item.qty - (item.discount || 0)
//     }));
    
//     console.log('Cart Item Details:', cartDetails);
    
//     const totalBeforeDiscounts = cart.reduce(
//       (sum, item) => sum + (item.price_list_rate * item.qty), 
//       0
//     );
    
//     const totalItemDiscounts = cart.reduce(
//       (sum, item) => sum + (item.discount || 0), 
//       0
//     );
    
//     const calculatedTotal = totalBeforeDiscounts - totalItemDiscounts - orderDiscount;
    
//     console.log('Calculation Breakdown:', {
//       totalBeforeDiscounts,
//       totalItemDiscounts,
//       orderDiscount,
//       calculatedTotal
//     });
    
//     set({ total: calculatedTotal });
    
//     return calculatedTotal;
//   },

// /** 🛒 Add Item to Cart */

// addToCart: (item) => {
//   // Check if the item's price is zero or undefined
//   if (!item.price_list_rate || item.price_list_rate <= 0) {
//     // Trigger a toast notification with an error message
//     toast.error(`Item "${item.item_name}" must have a valid price before adding to the cart.`);
//     return; // Exit the function to prevent adding the item
//   }

//   // Proceed to add the item to the cart
//   set((state) => {
//     const existingItem = state.cart.find((i) => i.item_code === item.item_code);
//     const updatedCart = existingItem
//       ? state.cart.map((i) =>
//           i.item_code === item.item_code ? { ...i, qty: i.qty + 1 } : i
//         )
//       : [...state.cart, { ...item, qty: 1 }];

//     // Save the updated cart to localStorage
//     localStorage.setItem('cart', JSON.stringify(updatedCart));

//     // Return the updated cart
//     return { cart: updatedCart };
//   });

//   // Recalculate and update the total after modifying the cart
//   const newTotal = get().calculateTotal();
//   set({ total: newTotal });
// },



//   /** ❌ Remove Item from Cart */
//   removeFromCart: (itemCode) => {
//     set((state) => {
//       const updatedCart = state.cart.filter((i) => i.item_code !== itemCode);
//       localStorage.setItem("cart", JSON.stringify(updatedCart));
//       return { cart: updatedCart };
//     });
    
//     // Calculate and update total after cart is updated
//     const newTotal = get().calculateTotal();
//     set({ total: newTotal });
//   },

//   /** 🔢 Update Item Quantity */
//   updateQuantity: (itemCode, qty) => {
//   if (qty < 1) return; // Prevents negative or zero quantities

//   set((state) => {
//     const updatedCart = state.cart.map((item) =>
//       item.item_code === itemCode ? { ...item, qty: qty } : item // ✅ Ensuring qty is updated
//     );

//     localStorage.setItem("cart", JSON.stringify(updatedCart)); // ✅ Persist changes in localStorage

//     return { cart: updatedCart };
//   });

//   // ✅ Recalculate and update the total after updating quantity
//   set((state) => ({ total: state.calculateTotal() }));
// },


//   /** ✏️ Update Item Details */
//   updateItem: (itemCode, qty, price, discount) => {
//     if (qty < 1) qty = 1;
//     set((state) => {
//       const updatedCart = state.cart.map((i) =>
//         i.item_code === itemCode
//           ? { ...i, qty, price_list_rate: price, discount }
//           : i
//       );
//       localStorage.setItem("cart", JSON.stringify(updatedCart));
//       return { cart: updatedCart };
//     });
    
//     // Calculate and update total after cart is updated
//     const newTotal = get().calculateTotal();
//     set({ total: newTotal });
//   },

//   /** 💰 Apply Order-wide Discount */
//   setOrderDiscount: (discount) => {
//     set({ orderDiscount: discount });
    
//     // Calculate and update total after discount is updated
//     const newTotal = get().calculateTotal();
//     set({ total: newTotal });
//   },

//   /** 👤 Set Customer */
//   setCustomer: (customer) => set({ customer }),

//   /** 📂 Set Active Category */
//   setSelectedCategory: (category) => set({ selectedCategory: category }),

//   /** 🧹 Clear Cart and Cache */
//   clearCart: () => {
//     set({
//       cart: [],
//       customer: null,
//       orderDiscount: 0,
//       selectedCategory: "",
//       total: 0 // Explicitly set total to 0
//     });

//     // ✅ Clear localStorage/sessionStorage
//     localStorage.removeItem("cart");
//     sessionStorage.removeItem("cart");
//   },

//   /** 🔄 Initialize Cart from Local Storage */
//   initializeCart: () => {
//     const savedCart = localStorage.getItem("cart");
//     if (savedCart) {
//       try {
//         const parsedCart = JSON.parse(savedCart);
//         set({ cart: parsedCart });
        
//         // Calculate total after setting cart
//         const newTotal = get().calculateTotal();
//         set({ total: newTotal });
//       } catch (error) {
//         console.error("Error parsing cart from localStorage:", error);
//         localStorage.removeItem("cart"); // Remove invalid data
//       }
//     }
//   },
// }));


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
    console.log("Setting customer:", customer); // ✅ Debugging step
    set({ customer });
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