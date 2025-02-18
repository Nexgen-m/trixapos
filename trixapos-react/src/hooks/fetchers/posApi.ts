import { db } from "../../lib/frappe";

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
export async function fetchProducts() {
  try {
    const response = await fetch("/api/method/nexapos.api.item_api.get_items");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    if (!Array.isArray(data.message)) {
      throw new Error("Invalid API response format");
    }

    return data.message;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to load products.");
  }
}
