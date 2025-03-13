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

    console.log("Customers API Response:", response); // 🔍 Debugging API response

    // ✅ Handle different possible API response structures
    if (response?.customers && Array.isArray(response.customers)) {
      return response.customers; // ✅ Expected format { customers: [...] }
    }

    if (response?.message?.customers && Array.isArray(response.message.customers)) {
      return response.message.customers; // ✅ Expected format { message: { customers: [...] } }
    }

    // ❌ Unexpected response format
    console.error("Invalid API Response Format for Customers:", response);
    throw new Error("Invalid API response format for customers.");
  } catch (error: any) {
    console.error("Error fetching customers:", error?.message || "Unknown Error");
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
  customer: string = "", // ✅ Include customer
  pageSize: number = 50
): Promise<{ 
  items: Item[]; 
  nextPage: number | null;
  price_list_used: string;
  using_standard_price: boolean;
}> {
  try {
    const response = await call.get("trixapos.api.item_api.get_items", {
      page,
      page_size: pageSize,
      category,
      search_term: searchTerm,
      customer, // ✅ Pass customer to fetch correct price list
    });

    console.log("Products API Response:", response); // 🔍 Debugging API response

    // ✅ Handle different response structures with proper default values
    if (response?.items && Array.isArray(response.items)) {
      return {
        items: response.items,
        nextPage: response.next_page ?? null,
        price_list_used: response.price_list_used || "Standard Selling",
        using_standard_price: response.using_standard_price === true,
      };
    }

    if (response?.message?.items && Array.isArray(response.message.items)) {
      return {
        items: response.message.items,
        nextPage: response.message.next_page ?? null,
        price_list_used: response.message.price_list_used || "Standard Selling",
        using_standard_price: response.message.using_standard_price === true,
      };
    }

    // ❌ Unexpected response format
    console.error("Invalid API Response Format for Products:", response);
    throw new Error("Invalid API response format for products.");
  } catch (error: any) {
    console.error("Error fetching products:", error?.message || "Unknown Error");
    return { 
      items: [], 
      nextPage: null,
      price_list_used: "Standard Selling",
      using_standard_price: true,
    };
  }
}