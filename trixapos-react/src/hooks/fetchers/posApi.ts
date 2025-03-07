import { call } from "../../lib/frappe"; // Using frappe-js-sdk
import { Item } from "../../types/pos";

/**
 * ✅ Fetch customers from Frappe API using frappe-js-sdk
 */
export async function fetchCustomers(searchTerm: string = "", limit: number = 50) {
  try {
    const response = await call.get("trixapos.api.customer_api.get_customers", {
      search_term: searchTerm,
      limit,
    });

    if (!response || !response.message || !Array.isArray(response.message.customers)) {
      throw new Error("Invalid API response format");
    }

    return response.message.customers;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw new Error("Failed to load customers.");
  }
}

/**
 * ✅ Fetch products from Frappe API (Custom API) with pagination, search, and category filter
 */
export async function fetchProducts(
  page: number = 1,
  category: string = "",
  searchTerm: string = "",
  pageSize: number = 50
): Promise<{ items: Item[]; nextPage: number | null }> {
  try {
    const response = await call.get("trixapos.api.item_api.get_items", {
      page,
      page_size: pageSize,
      category,
      search_term: searchTerm,
    });

    console.log("API Response:", response); // Debugging API response

    if (!response || !response.message || !Array.isArray(response.message.items)) {
      console.error("Invalid API Response Format:", response);
      throw new Error("Invalid API response format");
    }

    const data: Item[] = response.message.items || [];
    const nextPage: number | null = response.message.next_page ?? null;

    return { items: data, nextPage };
  } catch (error: any) {
    console.error("Full Error Object:", error);
    console.error("Error fetching products:", error?.message || "Unknown Error");
    return { items: [], nextPage: null };
  }
}
