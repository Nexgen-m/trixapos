import { useQuery } from "@tanstack/react-query";
import { fetchCustomers } from "./posApi";

/**
 * Custom Hook to fetch customers with caching & auto-refetching.
 */
export function useCustomers() {
  return useQuery({
    queryKey: ["customers"], // Cache key
    queryFn: fetchCustomers,
    staleTime: 10 * 60 * 1000, // Cache customers for 10 minutes
    retry: 2, // Retry fetching twice before failing
  });
}
