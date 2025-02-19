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
export async function fetchProducts(page: number) {
  const response = await fetch(
    `/api/method/nexapos.api.item_api.get_items?page=${page}&limit=20`
  );
  const data = await response.json();

  if (!response.ok) throw new Error("Error fetching products");

  return {
    items: data.message || [],
    nextPage: data.message.length < 20 ? null : page + 1, // ✅ If fewer than 20 items, no more pages
  };
}
