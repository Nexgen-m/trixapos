// import { db } from "../../lib/frappe";
// import { Item } from "../../types/pos";


// /**
//  * Fetch customers from Frappe API
//  */
// export async function fetchCustomers() {
//   try {
//     const customers = await db.getDocList("Customer", {
//       fields: ["name", "customer_name"],
//       limit: 50,
//     });

//     if (!Array.isArray(customers)) {
//       throw new Error("Invalid API response format");
//     }

//     return customers;
//   } catch (error) {
//     console.error("Error fetching customers:", error);
//     throw new Error("Failed to load customers.");
//   }
// }

// /**
//  * Fetch products from Frappe API
//  */

// export async function fetchProducts(
// page: number, category: string): Promise<{ items: Item[]; nextPage: number | null }> {
//   try {
//     const response = await fetch(`/api/method/nexapos.api.item_api.get_items?page=${page}`);

//     if (!response.ok) {
//       throw new Error(`Server error: ${response.status}`);
//     }

//     const data = await response.json();

//     // 🛠 Log the response for debugging
//     console.log("API Response:", data);

//     // ✅ Fix: `message` itself is an array, not an object
//     if (!Array.isArray(data.message)) {
//       throw new Error("Invalid API response format: expected an array");
//     }

//     return {
//       items: data.message, // ✅ Directly use `message` as the items array
//       nextPage: null, // 🚨 API doesn't provide `nextPage`, assuming null
//     };
//   } catch (error) {
//     console.error("Error fetching products:", error);
//     return { items: [], nextPage: null }; // ✅ Ensure safe fallback
//   }
// }


