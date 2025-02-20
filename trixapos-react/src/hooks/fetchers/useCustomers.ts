import { useQuery } from "@tanstack/react-query";
import { fetchCustomers } from "./posApi";
import { Customer } from "../../types/pos"; // Ensure this matches your data structure

/**
 * Custom Hook to fetch customers using custom API.
 */
export function useCustomers(searchTerm: string = "") {
  return useQuery<Customer[], Error>({
    queryKey: ["customers", searchTerm], // Unique cache key with search term
    queryFn: () => fetchCustomers(searchTerm),
    staleTime: 10 * 60 * 1000, // Cache customers for 10 minutes
    retry: 2, // Retry fetching twice before failing
    refetchOnWindowFocus: false, // Prevent refetching when switching tabs
  });
}
