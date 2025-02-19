import { db } from "../../lib/frappe";

interface ProductResponse {
  items: any[];
  nextPage: number | null;
}

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
export async function fetchProducts(pageParam: number): Promise<ProductResponse> {
  const response = await fetch(
    `/api/method/nexapos.api.item_api.get_items?page=${pageParam}`
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  return {
    items: Array.isArray(data.message) ? data.message : [],
    nextPage: data.nextPage ?? null, // ✅ Ensure nextPage is correctly handled
  };
}
