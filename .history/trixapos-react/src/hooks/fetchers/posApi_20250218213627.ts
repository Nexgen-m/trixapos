import { db } from "../../lib/frappe";
import { Item } from "../../types/pos";


/**
 * Fetch customers from Frappe API
 */
export async function fetchCustomers() {
  try {
    const customers = await db.getDocList("Customer", {
      fields: ["name", "customer_name"],
      limit: 50,
    });

    if (!Array.isArray(customers)) {
      throw new Error("Invalid API response format");
    }

    return customers;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw new Error("Failed to load customers.");
  }
}

/**
 * Fetch products from Frappe API
 */
export async function fetchProducts(
  page: number
): Promise<{ items: Item[]; nextPage: number | null }> {
  try {
    const response = await fetch(`/api/method/nexapos.api.item_api.get_items?page=${page}`);

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    
    // 🛠 Debugging: Log the raw API response to inspect structure
    console.log("API Response:", data);

    // ✅ Validate API response structure
    if (!data.message || typeof data.message !== "object") {
      throw new Error("Invalid API response: 'message' is missing or incorrect");
    }

    if (!Array.isArray(data.message.items)) {
      console.warn("Warning: API returned unexpected structure", data);
      return { items: [], nextPage: null }; // ✅ Safe fallback
    }

    return {
      items: data.message.items,
      nextPage: typeof data.message.nextPage === "number" ? data.message.nextPage : null,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { items: [], nextPage: null }; // ✅ Safe fallback for failed requests
  }
}
