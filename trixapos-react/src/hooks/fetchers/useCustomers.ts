import { useQuery } from "@tanstack/react-query";
import { call } from "@/lib/frappe"; // Using frappe-js-sdk

/**
 * Custom Hook to fetch customers using custom API.
 */
export function useCustomers(searchTerm: string = "", limit: number = 50) {
  return useQuery({
    queryKey: ["customers", searchTerm],
    queryFn: () => fetchCustomers(searchTerm, limit),
    staleTime: 10 * 60 * 1000, // Cache customers for 10 minutes
    retry: 2, // Retry fetching twice before failing
    refetchOnWindowFocus: false, // Prevent refetching when switching tabs
  });
}

/**
 * Custom Hook to fetch Customer doctype meta.
 */
export function useCustomerMeta() {
  return useQuery({
    queryKey: ["customerMeta"],
    queryFn: () => fetchCustomerMeta(),
    staleTime: 10 * 60 * 1000, // Cache meta for 10 minutes
    retry: 2, // Retry fetching twice before failing
    refetchOnWindowFocus: false, // Prevent refetching when switching tabs
  });
}

/**
 * Custom Hook to fetch customer groups.
 */
export function useCustomerGroups() {
  return useQuery({
    queryKey: ["customerGroups"],
    queryFn: () => fetchCustomerGroups(),
    staleTime: 10 * 60 * 1000, // Cache customer groups for 10 minutes
    retry: 2, // Retry fetching twice before failing
    refetchOnWindowFocus: false, // Prevent refetching when switching tabs
  });
}

/**
 * Fetch customers from Frappe API using frappe-js-sdk
 */
export async function fetchCustomers(searchTerm: string = "", limit: number = 50) {
  try {
    const response = await call.get("trixapos.api.customer_api.get_customers", {
      search_term: searchTerm,
      limit,
    });

    console.log("Customers API Response:", response); // Debugging API response

    // Handle different possible API response structures
    if (response?.customers && Array.isArray(response.customers)) {
      return response.customers; // Expected format { customers: [...] }
    }

    if (response?.message?.customers && Array.isArray(response.message.customers)) {
      return response.message.customers; // Expected format { message: { customers: [...] } }
    }

    // Unexpected response format
    console.error("Invalid API Response Format for Customers:", response);
    throw new Error("Invalid API response format for customers.");
  } catch (error: any) {
    console.error("Error fetching customers:", error?.message || "Unknown Error");
    throw new Error("Failed to load customers.");
  }
}

/**
 * Fetch Customer doctype meta
 */
export async function fetchCustomerMeta() {
  try {
    const response = await call.get("trixapos.api.customer_api.get_customer_meta");

    console.log("Customer Meta API Response:", response); // Debugging API response

    // Handle different possible API response structures
    if (response?.mandatoryFields && response?.customer_type_options && response?.customer_group_options) {
      return response; // Expected format
    }

    if (response?.message?.mandatoryFields && response?.message?.customer_type_options && response?.message?.customer_group_options) {
      return response.message; // Expected format { message: { ... } }
    }

    // Unexpected response format
    console.error("Invalid API Response Format for Customer Meta:", response);
    throw new Error("Invalid API response format for customer meta.");
  } catch (error: any) {
    console.error("Error fetching customer meta:", error?.message || "Unknown Error");
    throw new Error("Failed to load customer meta.");
  }
}

/**
 * Fetch customer groups from Frappe API using frappe-js-sdk
 */
export async function fetchCustomerGroups() {
  try {
    const response = await call.get("trixapos.api.customer_api.get_customer_groups");

    console.log("Customer Groups API Response:", response); // Debugging API response

    // Handle different possible API response structures
    if (response?.customer_groups && Array.isArray(response.customer_groups)) {
      return response.customer_groups; // Expected format { customer_groups: [...] }
    }

    if (response?.message?.customer_groups && Array.isArray(response.message.customer_groups)) {
      return response.message.customer_groups; // Expected format { message: { customer_groups: [...] } }
    }

    // Unexpected response format
    console.error("Invalid API Response Format for Customer Groups:", response);
    throw new Error("Invalid API response format for customer groups.");
  } catch (error: any) {
    console.error("Error fetching customer groups:", error?.message || "Unknown Error");
    throw new Error("Failed to load customer groups.");
  }
}