import { useQuery } from "@tanstack/react-query";
import { fetchCustomers } from "./posApi"; // Ensure this function exists and works properly

/**
 * Custom Hook to fetch customers with caching & auto-refetching.
 */
export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      try {
        const data = await fetchCustomers();

        if (!Array.isArray(data)) {
          throw new Error("Invalid API response format");
        }

        return data;
      } catch (error) {
        console.error("Error fetching customers:", error);
        throw new Error("Failed to fetch customers");
      }
    },
    staleTime: 10 * 60 * 1000, // Cache customers for 10 minutes
    retry: 2, // Retry fetching twice before failing
  });
}
